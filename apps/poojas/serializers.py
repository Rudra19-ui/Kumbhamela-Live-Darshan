from rest_framework import serializers

from .models import PoojaCategory, PoojaOffering


class PoojaCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PoojaCategory
        fields = (
            "id",
            "name",
            "name_hindi",
            "description",
            "icon_url",
            "is_active",
            "sort_order",
        )


class PoojaOfferingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoojaOffering
        fields = (
            "id",
            "category",
            "name",
            "name_hindi",
            "description",
            "duration_minutes",
            "mode",
            "base_price",
            "includes_prasad",
            "includes_samagri",
            "samagri_list",
            "max_participants",
            "thumbnail_url",
            "is_active",
        )
