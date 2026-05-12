import hashlib
import hmac

from django.conf import settings
from rest_framework import permissions, status, views
from rest_framework.response import Response

from .models import Payment


class PaymentVerifyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id")
        pay_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")
        secret = getattr(settings, "RAZORPAY_KEY_SECRET", "") or ""
        if not (order_id and pay_id and signature and secret):
            return Response({"detail": "Missing fields or gateway not configured."}, status=status.HTTP_400_BAD_REQUEST)
        msg = f"{order_id}|{pay_id}".encode()
        digest = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, signature):
            return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Signature valid; rely on webhooks for final capture."})


class PaymentHistoryListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Payment.objects.filter(user=request.user).order_by("-created_at")[:50]
        data = [
            {
                "id": str(p.id),
                "reference": p.payment_reference,
                "amount": str(p.amount),
                "status": p.status,
                "entity_type": p.entity_type,
                "created_at": p.created_at.isoformat(),
            }
            for p in qs
        ]
        return Response(data)
