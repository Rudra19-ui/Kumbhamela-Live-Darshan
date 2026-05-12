from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions

from .models import PoojaCategory, PoojaOffering
from .serializers import PoojaCategorySerializer, PoojaOfferingSerializer


class PoojaCategoryListView(generics.ListAPIView):
    queryset = PoojaCategory.objects.filter(is_active=True)
    serializer_class = PoojaCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PoojaOfferingListView(generics.ListAPIView):
    queryset = PoojaOffering.objects.filter(is_active=True)
    serializer_class = PoojaOfferingSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "mode"]
    search_fields = ["name", "name_hindi"]
    ordering_fields = ["base_price", "duration_minutes", "created_at"]


class PoojaOfferingDetailView(generics.RetrieveAPIView):
    queryset = PoojaOffering.objects.filter(is_active=True)
    serializer_class = PoojaOfferingSerializer
    permission_classes = [permissions.AllowAny]
