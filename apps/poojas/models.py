import uuid

from django.db import models


class PoojaCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    icon_url = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = "pooja_categories"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class PoojaOffering(models.Model):
    MODE_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
        ("both", "Both"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(PoojaCategory, on_delete=models.CASCADE, related_name="offerings")
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    duration_minutes = models.PositiveIntegerField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    includes_prasad = models.BooleanField(default=False)
    includes_samagri = models.BooleanField(default=False)
    samagri_list = models.JSONField(default=list, blank=True)
    max_participants = models.PositiveIntegerField(default=1)
    thumbnail_url = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pooja_offerings"

    def __str__(self):
        return self.name
