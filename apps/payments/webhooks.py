import hashlib
import hmac
import json
import logging

from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from apps.bookings.models import PoojaBooking
from apps.core.redis_lock import release_slot_lock
from apps.core.utils import qr_payload

from .models import Payment

logger = logging.getLogger(__name__)


def _verify_signature(body: bytes, signature: str) -> bool:
    secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "") or ""
    if not secret:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not set; rejecting webhook")
        return False
    digest = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


@csrf_exempt
@require_POST
def razorpay_webhook(request):
    sig = request.headers.get("X-Razorpay-Signature", "")
    body = request.body
    if not _verify_signature(body, sig):
        return HttpResponseBadRequest("invalid signature")

    try:
        payload = json.loads(body.decode())
    except json.JSONDecodeError:
        return HttpResponseBadRequest("invalid json")

    event = payload.get("event")
    entity = (payload.get("payload") or {}).get("payment") or {}
    entity = entity.get("entity") or {}

    if event == "payment.captured":
        payment_id = entity.get("id")
        order_id = entity.get("order_id")
        with transaction.atomic():
            payment = Payment.objects.select_for_update().filter(razorpay_order_id=order_id).first()
            if not payment:
                return HttpResponse(status=200)
            if payment.status == "success":
                return HttpResponse(status=200)
            payment.razorpay_payment_id = payment_id or ""
            payment.status = "success"
            payment.gateway_response = payload
            payment.save()

            if payment.entity_type == "pooja_booking":
                booking = PoojaBooking.objects.select_for_update().get(pk=payment.entity_id)
                booking.status = "confirmed"
                if booking.mode == "offline":
                    booking.qr_code_data = qr_payload(booking.id)
                booking.save()
                slot = booking.slot
                slot.current_bookings += 1
                slot.save(update_fields=["current_bookings"])
                release_slot_lock(slot.id, str(booking.user_id))

    elif event == "payment.failed":
        order_id = entity.get("order_id")
        with transaction.atomic():
            payment = Payment.objects.select_for_update().filter(razorpay_order_id=order_id).first()
            if payment and payment.status not in ("success", "refunded"):
                payment.status = "failed"
                payment.gateway_response = payload
                payment.save()
                if payment.entity_type == "pooja_booking":
                    booking = PoojaBooking.objects.select_for_update().get(pk=payment.entity_id)
                    booking.status = "cancelled"
                    booking.cancelled_at = timezone.now()
                    booking.cancellation_reason = "Payment failed"
                    booking.save()
                    release_slot_lock(booking.slot_id, str(booking.user_id))

    return HttpResponse(status=200)
