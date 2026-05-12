from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = (
            "id",
            "title",
            "title_hindi",
            "body",
            "body_hindi",
            "type",
            "created_at",
        )
