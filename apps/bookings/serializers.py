from rest_framework import serializers

from apps.live_stream.models import CameraFeed
from apps.poojas.serializers import PoojaOfferingSerializer
from apps.pundits.serializers import PunditProfileSerializer

from .models import MandapLocation, PoojaBooking, PoojaSlot


class CameraFeedMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CameraFeed
        fields = (
            "id",
            "name",
            "name_hindi",
            "stream_url_hls",
            "youtube_live_url",
            "thumbnail_url",
            "is_live",
            "requires_booking",
        )


class MandapLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MandapLocation
        fields = (
            "id",
            "name",
            "name_hindi",
            "address",
            "latitude",
            "longitude",
            "ghat_name",
            "capacity",
            "facilities",
            "is_active",
        )


class PoojaSlotSerializer(serializers.ModelSerializer):
    offering = PoojaOfferingSerializer(read_only=True)
    pundit = PunditProfileSerializer(read_only=True)
    mandap_location = MandapLocationSerializer(read_only=True)
    camera_feed = CameraFeedMiniSerializer(read_only=True)

    class Meta:
        model = PoojaSlot
        fields = (
            "id",
            "offering",
            "pundit",
            "date",
            "start_time",
            "end_time",
            "mode",
            "max_bookings",
            "current_bookings",
            "mandap_location",
            "camera_feed",
            "is_available",
        )


class PoojaBookingSerializer(serializers.ModelSerializer):
    slot = PoojaSlotSerializer(read_only=True)

    class Meta:
        model = PoojaBooking
        fields = (
            "id",
            "booking_number",
            "slot",
            "mode",
            "sankalp_name",
            "sankalp_gotra",
            "sankalp_city",
            "sankalp_occasion",
            "sankalp_notes",
            "participant_count",
            "participant_names",
            "amount",
            "platform_fee",
            "samagri_charges",
            "total_amount",
            "status",
            "qr_code_data",
            "stream_access_token",
            "stream_access_expires_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "booking_number",
            "slot",
            "mode",
            "amount",
            "platform_fee",
            "samagri_charges",
            "total_amount",
            "status",
            "qr_code_data",
            "stream_access_token",
            "stream_access_expires_at",
            "created_at",
        )


class CreateBookingSerializer(serializers.Serializer):
    slot_id = serializers.UUIDField()
    mode = serializers.ChoiceField(choices=["online", "offline"])
    sankalp_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sankalp_gotra = serializers.CharField(max_length=100, required=False, allow_blank=True)
    sankalp_city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    sankalp_occasion = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sankalp_notes = serializers.CharField(required=False, allow_blank=True)
    participant_count = serializers.IntegerField(min_value=1, default=1)
    participant_names = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class ScanQRSerializer(serializers.Serializer):
    qr_data = serializers.CharField()
