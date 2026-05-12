import logging
import secrets
from decimal import Decimal

from django.conf import settings

from apps.bookings.models import PoojaBooking

from .models import Payment

logger = logging.getLogger(__name__)


def create_razorpay_order_for_booking(booking: PoojaBooking) -> dict:
    ref = f"PAY-{booking.booking_number}-{secrets.token_hex(3)}"
    payment = Payment.objects.create(
        payment_reference=ref,
        user=booking.user,
        entity_type="pooja_booking",
        entity_id=booking.id,
        amount=booking.total_amount,
        status="pending",
    )
    key_id = getattr(settings, "RAZORPAY_KEY_ID", "") or ""
    secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
    if key_id and secret:
        try:
            import razorpay

            client = razorpay.Client(auth=(key_id, secret))
            rz = client.order.create(
                {
                    "amount": int(Decimal(booking.total_amount) * 100),
                    "currency": "INR",
                    "receipt": ref,
                    "notes": {"booking_id": str(booking.id)},
                }
            )
            payment.razorpay_order_id = rz["id"]
            payment.status = "initiated"
            payment.save(update_fields=["razorpay_order_id", "status", "updated_at"])
            return {
                "razorpay_order_id": rz["id"],
                "amount_paise": rz["amount"],
                "currency": rz["currency"],
                "key_id": key_id,
                "payment_reference": ref,
                "payment_id": str(payment.id),
            }
        except Exception as exc:  # noqa: BLE001
            logger.exception("Razorpay order failed: %s", exc)
    return {
        "razorpay_order_id": None,
        "mock": True,
        "payment_reference": ref,
        "key_id": key_id or None,
        "payment_id": str(payment.id),
        "amount_paise": int(Decimal(booking.total_amount) * 100),
    }
