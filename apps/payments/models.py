import uuid

from django.conf import settings
from django.db import models


class Payment(models.Model):
    ENTITY_CHOICES = [
        ("pooja_booking", "Pooja booking"),
        ("vip_darshan", "VIP darshan"),
        ("order", "Order"),
        ("donation", "Donation"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("initiated", "Initiated"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
        ("partially_refunded", "Partially refunded"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_reference = models.CharField(max_length=100, unique=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default="")
    razorpay_signature = models.CharField(max_length=255, blank=True, default="")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    entity_type = models.CharField(max_length=30, choices=ENTITY_CHOICES)
    entity_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default="INR")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=50, blank=True, default="")
    gateway_response = models.JSONField(null=True, blank=True)
    refund_id = models.CharField(max_length=100, blank=True, default="")
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_reason = models.TextField(blank=True, default="")
    refunded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
