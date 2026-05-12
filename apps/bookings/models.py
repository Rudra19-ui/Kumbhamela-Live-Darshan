import uuid

from django.conf import settings
from django.db import models


class MandapLocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, default="")
    address = models.TextField(blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    ghat_name = models.CharField(max_length=255, blank=True, default="")
    capacity = models.PositiveIntegerField(null=True, blank=True)
    facilities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "mandap_locations"

    def __str__(self):
        return self.name


class PoojaSlot(models.Model):
    MODE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    offering = models.ForeignKey("poojas.PoojaOffering", on_delete=models.CASCADE, related_name="slots")
    pundit = models.ForeignKey("pundits.PunditProfile", on_delete=models.CASCADE, related_name="slots")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    max_bookings = models.PositiveIntegerField(default=1)
    current_bookings = models.PositiveIntegerField(default=0)
    camera_feed = models.ForeignKey(
        "live_stream.CameraFeed",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pooja_slots",
    )
    mandap_location = models.ForeignKey(
        MandapLocation,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pooja_slots",
    )
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pooja_slots"
        constraints = [
            models.UniqueConstraint(
                fields=["pundit", "date", "start_time"],
                name="uniq_pundit_date_start",
            )
        ]

    def __str__(self):
        return f"{self.offering} @ {self.date} {self.start_time}"


class PoojaBooking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
        ("no_show", "No show"),
    ]
    MODE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_number = models.CharField(max_length=20, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="pooja_bookings")
    slot = models.ForeignKey(PoojaSlot, on_delete=models.PROTECT, related_name="bookings")
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    sankalp_name = models.CharField(max_length=255, blank=True, default="")
    sankalp_gotra = models.CharField(max_length=100, blank=True, default="")
    sankalp_city = models.CharField(max_length=100, blank=True, default="")
    sankalp_occasion = models.CharField(max_length=255, blank=True, default="")
    sankalp_notes = models.TextField(blank=True, default="")
    participant_count = models.PositiveIntegerField(default=1)
    participant_names = models.JSONField(default=list, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    samagri_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="pending")
    qr_code_data = models.TextField(blank=True, default="")
    qr_scanned_at = models.DateTimeField(null=True, blank=True)
    qr_scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="qr_scans_done",
    )
    stream_access_token = models.TextField(blank=True, default="")
    stream_access_expires_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default="")
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings_cancelled",
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    pundit_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pooja_bookings"

    def __str__(self):
        return self.booking_number
