import uuid

from django.conf import settings
from django.db import models


class CameraFeed(models.Model):
    TYPE_CHOICES = [
        ("public", "Public"),
        ("vip", "VIP"),
        ("pooja_mandap", "Pooja Mandap"),
        ("aarti", "Aarti"),
        ("crowd", "Crowd"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, default="")
    location_description = models.TextField(blank=True, default="")
    camera_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default="public")
    stream_url_hls = models.TextField(blank=True, default="")
    stream_url_rtmp = models.TextField(blank=True, default="")
    youtube_live_url = models.TextField(blank=True, default="")
    thumbnail_url = models.TextField(blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_live = models.BooleanField(default=False)
    requires_booking = models.BooleanField(default=False)
    viewer_count = models.PositiveIntegerField(default=0)
    last_health_check = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "camera_feeds"

    def __str__(self):
        return self.name


class DarshanSchedule(models.Model):
    EVENT_CHOICES = [
        ("aarti", "Aarti"),
        ("snan", "Snan"),
        ("pooja", "Pooja"),
        ("procession", "Procession"),
        ("special", "Special"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    camera_feed = models.ForeignKey(CameraFeed, on_delete=models.CASCADE, related_name="schedules")
    title = models.CharField(max_length=255)
    title_hindi = models.CharField(max_length=255, blank=True, default="")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES, default="aarti")
    description = models.TextField(blank=True, default="")
    is_free = models.BooleanField(default=True)
    entry_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "darshan_schedules"

    def __str__(self):
        return self.title


class VIPDarshanBooking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vip_darshan_bookings")
    schedule = models.ForeignKey(DarshanSchedule, on_delete=models.CASCADE, related_name="vip_bookings")
    qr_code_data = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vip_darshan_bookings"
