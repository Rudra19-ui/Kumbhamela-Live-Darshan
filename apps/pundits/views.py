from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions

from apps.bookings.models import PoojaSlot
from apps.bookings.serializers import PoojaSlotSerializer

from .models import PunditProfile
from .serializers import PunditProfileSerializer


class PunditSlotListView(generics.ListAPIView):
    serializer_class = PoojaSlotSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        pk = self.kwargs["pk"]
        qs = PoojaSlot.objects.filter(pundit_id=pk, is_available=True).select_related(
            "offering",
            "offering__category",
            "pundit",
            "pundit__user",
            "mandap_location",
            "camera_feed",
        )
        date = self.request.query_params.get("date")
        mode = self.request.query_params.get("mode")
        if date:
            qs = qs.filter(date=date)
        if mode:
            qs = qs.filter(mode=mode)
        return qs


class PunditListView(generics.ListAPIView):
    queryset = PunditProfile.objects.filter(is_approved=True, is_available=True)
    serializer_class = PunditProfileSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_available"]


class PunditDetailView(generics.RetrieveAPIView):
    queryset = PunditProfile.objects.filter(is_approved=True)
    serializer_class = PunditProfileSerializer
    permission_classes = [permissions.AllowAny]
