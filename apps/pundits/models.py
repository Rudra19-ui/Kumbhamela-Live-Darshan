import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class PunditProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pundit_profile",
    )
    specializations = models.JSONField(default=list, blank=True)
    languages_spoken = models.JSONField(default=list, blank=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True, default="")
    govid_type = models.CharField(max_length=50, blank=True, default="")
    govid_number = models.CharField(max_length=100, blank=True, default="")
    govid_document_url = models.TextField(blank=True, default="")
    certificate_url = models.TextField(blank=True, default="")
    bank_account_number = models.CharField(max_length=50, blank=True, default="")
    bank_ifsc = models.CharField(max_length=20, blank=True, default="")
    bank_account_name = models.CharField(max_length=255, blank=True, default="")
    upi_id = models.CharField(max_length=100, blank=True, default="")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_reviews = models.PositiveIntegerField(default=0)
    total_poojas_done = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)
    approval_notes = models.TextField(blank=True, default="")
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pundits_approved",
    )
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pundit_profiles"

    def __str__(self):
        return f"Pundit {self.user.full_name}"


class PunditReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pundit = models.ForeignKey(PunditProfile, on_delete=models.CASCADE, related_name="reviews")
    booking = models.ForeignKey(
        "bookings.PoojaBooking",
        on_delete=models.CASCADE,
        related_name="pundit_reviews",
    )
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pundit_reviews"

    def __str__(self):
        return f"Review {self.rating} for {self.pundit_id}"
