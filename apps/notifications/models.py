import uuid

from django.conf import settings
from django.db import models


class Announcement(models.Model):
    TYPE_CHOICES = [
        ("general", "General"),
        ("schedule_change", "Schedule change"),
        ("emergency", "Emergency"),
        ("tip", "Tip"),
        ("event", "Event"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    title_hindi = models.CharField(max_length=255, blank=True, default="")
    body = models.TextField()
    body_hindi = models.TextField(blank=True, default="")
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    target_roles = models.JSONField(default=list)
    is_push_sent = models.BooleanField(default=False)
    push_sent_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="announcements_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "announcements"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    body = models.TextField()
    type = models.CharField(max_length=50, blank=True, default="")
    entity_type = models.CharField(max_length=30, blank=True, default="")
    entity_id = models.UUIDField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
