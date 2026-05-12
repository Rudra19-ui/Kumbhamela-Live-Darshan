from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from apps.core.permissions import IsStaffScanner
from apps.core.redis_lock import acquire_slot_lock, get_slot_lock_owner, release_slot_lock
from apps.core.utils import generate_booking_number, qr_payload, verify_qr_payload
from apps.payments.services import create_razorpay_order_for_booking

from .models import PoojaBooking, PoojaSlot
from .serializers import (
    CreateBookingSerializer,
    PoojaBookingSerializer,
    PoojaSlotSerializer,
    ScanQRSerializer,
)


class PoojaSlotListView(generics.ListAPIView):
    queryset = PoojaSlot.objects.filter(is_available=True).select_related(
        "offering",
        "offering__category",
        "pundit",
        "pundit__user",
        "mandap_location",
        "camera_feed",
    )
    serializer_class = PoojaSlotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        offering = self.request.query_params.get("offering")
        pundit = self.request.query_params.get("pundit")
        date = self.request.query_params.get("date")
        mode = self.request.query_params.get("mode")
        if offering:
            qs = qs.filter(offering_id=offering)
        if pundit:
            qs = qs.filter(pundit_id=pundit)
        if date:
            qs = qs.filter(date=date)
        if mode:
            qs = qs.filter(mode=mode)
        return qs


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateBookingSerializer
        return PoojaBookingSerializer

    def get_queryset(self):
        return PoojaBooking.objects.filter(user=self.request.user).select_related(
            "slot",
            "slot__offering",
            "slot__pundit",
            "slot__pundit__user",
        )

    def create(self, request, *args, **kwargs):
        ser = CreateBookingSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        user = request.user

        with transaction.atomic():
            slot = PoojaSlot.objects.select_for_update().get(pk=data["slot_id"])
            if slot.mode != data["mode"]:
                return Response({"detail": "Mode does not match slot."}, status=status.HTTP_400_BAD_REQUEST)
            if slot.current_bookings >= slot.max_bookings:
                return Response({"detail": "Slot is full."}, status=status.HTTP_400_BAD_REQUEST)
            if not acquire_slot_lock(slot.id, str(user.id)):
                owner = get_slot_lock_owner(slot.id)
                return Response(
                    {"detail": "Slot is temporarily held.", "held_by_session": owner is not None},
                    status=status.HTTP_409_CONFLICT,
                )

            fee_pct = Decimal(getattr(settings, "PLATFORM_POOJA_FEE_PERCENT", 15)) / Decimal(100)
            base = slot.offering.base_price
            platform_fee = (base * fee_pct).quantize(Decimal("0.01"))
            total = (base + platform_fee).quantize(Decimal("0.01"))

            booking = PoojaBooking.objects.create(
                booking_number=generate_booking_number(),
                user=user,
                slot=slot,
                mode=data["mode"],
                sankalp_name=data.get("sankalp_name") or "",
                sankalp_gotra=data.get("sankalp_gotra") or "",
                sankalp_city=data.get("sankalp_city") or "",
                sankalp_occasion=data.get("sankalp_occasion") or "",
                sankalp_notes=data.get("sankalp_notes") or "",
                participant_count=data.get("participant_count") or 1,
                participant_names=data.get("participant_names") or [],
                amount=base,
                platform_fee=platform_fee,
                samagri_charges=Decimal("0"),
                total_amount=total,
                status="pending",
            )

        payment_payload = create_razorpay_order_for_booking(booking)
        return Response(
            {"booking": PoojaBookingSerializer(booking).data, "payment": payment_payload},
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = PoojaBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PoojaBooking.objects.filter(user=self.request.user)


class BookingConfirmWithoutPaymentView(views.APIView):
    """Confirm a pending booking without Razorpay when SKIP_PAYMENT_CONFIRMATION is enabled."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not getattr(settings, "SKIP_PAYMENT_CONFIRMATION", False):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            booking = (
                PoojaBooking.objects.select_for_update()
                .select_related("slot")
                .filter(pk=pk, user=request.user)
                .first()
            )
            if not booking:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            if booking.status != "pending":
                return Response(
                    {"detail": f"Booking is already {booking.status}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            booking.status = "confirmed"
            if booking.mode == "offline":
                booking.qr_code_data = qr_payload(booking.id)
            booking.save()
            slot = booking.slot
            slot.current_bookings += 1
            slot.save(update_fields=["current_bookings"])
            release_slot_lock(slot.id, str(request.user.id))
        booking.refresh_from_db()
        return Response(PoojaBookingSerializer(booking).data, status=status.HTTP_200_OK)


class ScanQRView(views.APIView):
    permission_classes = [IsStaffScanner]

    def post(self, request):
        ser = ScanQRSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        bid = verify_qr_payload(ser.validated_data["qr_data"])
        if not bid:
            return Response({"detail": "Invalid QR."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking = PoojaBooking.objects.select_related("user", "slot", "slot__offering").get(pk=bid)
        except PoojaBooking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.qr_scanned_at:
            return Response({"detail": "QR already used."}, status=status.HTTP_400_BAD_REQUEST)

        booking.qr_scanned_at = timezone.now()
        booking.qr_scanned_by = request.user
        booking.save(update_fields=["qr_scanned_at", "qr_scanned_by", "updated_at"])

        return Response(
            {
                "booking_number": booking.booking_number,
                "devotee_name": booking.user.full_name,
                "sankalp_name": booking.sankalp_name,
                "pooja": booking.slot.offering.name,
                "slot_time": f"{booking.slot.date} {booking.slot.start_time}",
            }
        )
