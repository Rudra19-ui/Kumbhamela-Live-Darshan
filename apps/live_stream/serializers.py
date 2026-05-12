from rest_framework import serializers

from .models import CameraFeed, DarshanSchedule, VIPDarshanBooking


class CameraFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = CameraFeed
        fields = (
            "id",
            "name",
            "name_hindi",
            "location_description",
            "camera_type",
            "stream_url_hls",
            "youtube_live_url",
            "thumbnail_url",
            "latitude",
            "longitude",
            "is_active",
            "is_live",
            "requires_booking",
            "viewer_count",
            "last_health_check",
        )


class DarshanScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DarshanSchedule
        fields = (
            "id",
            "camera_feed",
            "title",
            "title_hindi",
            "start_datetime",
            "end_datetime",
            "event_type",
            "description",
            "is_free",
            "entry_price",
            "is_published",
        )


class VIPDarshanBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VIPDarshanBooking
        fields = ("id", "schedule", "amount", "status", "created_at", "qr_code_data")
        read_only_fields = ("id", "status", "created_at", "qr_code_data")
