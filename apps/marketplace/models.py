import uuid

from django.conf import settings
from django.db import models


class VendorProfile(models.Model):
    CATEGORY_CHOICES = [
        ("prasad", "Prasad"),
        ("samagri", "Samagri"),
        ("books", "Books"),
        ("idols", "Idols"),
        ("clothing", "Clothing"),
        ("food", "Food"),
        ("handicraft", "Handicraft"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_profile",
    )
    shop_name = models.CharField(max_length=255)
    shop_name_hindi = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    logo_url = models.TextField(blank=True, default="")
    banner_url = models.TextField(blank=True, default="")
    gst_number = models.CharField(max_length=20, blank=True, default="")
    pan_number = models.CharField(max_length=20, blank=True, default="")
    bank_account_number = models.CharField(max_length=50, blank=True, default="")
    bank_ifsc = models.CharField(max_length=20, blank=True, default="")
    bank_account_name = models.CharField(max_length=255, blank=True, default="")
    upi_id = models.CharField(max_length=100, blank=True, default="")
    stall_location = models.TextField(blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vendor_profiles"

    def __str__(self):
        return self.shop_name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=50, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=30, default="piece")
    images = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    total_sold = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "products"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("processing", "Processing"),
        ("ready", "Ready"),
        ("picked_up", "Picked up"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]
    PICKUP_CHOICES = [
        ("self_pickup", "Self pickup"),
        ("stall_delivery", "Stall delivery"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="orders")
    items = models.JSONField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="pending")
    pickup_type = models.CharField(max_length=20, choices=PICKUP_CHOICES, null=True, blank=True)
    pickup_slot = models.DateTimeField(null=True, blank=True)
    pickup_otp = models.CharField(max_length=6, blank=True, default="")
    delivery_address = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
