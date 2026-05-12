from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions

from .models import CameraFeed, DarshanSchedule, VIPDarshanBooking
from .serializers import CameraFeedSerializer, DarshanScheduleSerializer, VIPDarshanBookingSerializer


class CameraFeedListView(generics.ListAPIView):
    queryset = CameraFeed.objects.filter(is_active=True)
    serializer_class = CameraFeedSerializer
    permission_classes = [permissions.AllowAny]


class CameraFeedDetailView(generics.RetrieveAPIView):
    queryset = CameraFeed.objects.filter(is_active=True)
    serializer_class = CameraFeedSerializer
    permission_classes = [permissions.AllowAny]


class DarshanScheduleListView(generics.ListAPIView):
    queryset = DarshanSchedule.objects.filter(is_published=True)
    serializer_class = DarshanScheduleSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["camera_feed", "event_type"]


class VIPDarshanListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VIPDarshanBookingSerializer

    def get_queryset(self):
        return VIPDarshanBooking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        schedule = serializer.validated_data["schedule"]
        price = schedule.entry_price if schedule.entry_price is not None else 0
        serializer.save(user=self.request.user, status="confirmed", amount=price)
