from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

from .models import PunditProfile, PunditReview


class PunditProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PunditProfile
        fields = (
            "id",
            "user",
            "specializations",
            "languages_spoken",
            "experience_years",
            "description",
            "rating",
            "total_reviews",
            "total_poojas_done",
            "is_approved",
            "is_available",
        )


class PunditReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PunditReview
        fields = ("id", "rating", "comment", "created_at")
