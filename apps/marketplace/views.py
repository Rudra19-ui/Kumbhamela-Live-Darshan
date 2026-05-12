from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils.crypto import get_random_string
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, permissions, status, views
from rest_framework.response import Response

from apps.core.utils import generate_order_number

from .models import Order, Product, VendorProfile
from .serializers import (
    CheckoutDevSerializer,
    OrderSerializer,
    ProductSerializer,
    VendorProfileSerializer,
)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_approved=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["vendor", "category"]
    search_fields = ["name", "name_hindi"]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True, is_approved=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class VendorListView(generics.ListAPIView):
    queryset = VendorProfile.objects.filter(is_active=True, is_approved=True)
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.AllowAny]


class VendorDetailView(generics.RetrieveAPIView):
    queryset = VendorProfile.objects.filter(is_active=True, is_approved=True)
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.AllowAny]


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CheckoutDevView(views.APIView):
    """Create order as paid without Razorpay when SKIP_PAYMENT_CONFIRMATION is enabled."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not getattr(settings, "SKIP_PAYMENT_CONFIRMATION", False):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = CheckoutDevSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        lines = ser.validated_data["lines"]
        pickup_type = ser.validated_data["pickup_type"]
        ids = [str(line["product_id"]) for line in lines]
        products = list(
            Product.objects.filter(id__in=ids, is_active=True, is_approved=True).select_related("vendor")
        )
        if len(products) != len(set(ids)):
            return Response({"detail": "One or more products not found."}, status=status.HTTP_400_BAD_REQUEST)
        vendor_ids = {p.vendor_id for p in products}
        if len(vendor_ids) != 1:
            return Response({"detail": "All items must be from the same shop."}, status=status.HTTP_400_BAD_REQUEST)
        vendor = products[0].vendor
        qty_map = {str(line["product_id"]): int(line["quantity"]) for line in lines}
        items = []
        subtotal = Decimal("0")
        for p in products:
            qty = qty_map[str(p.id)]
            if qty > p.stock_quantity:
                return Response(
                    {"detail": f"Insufficient stock for {p.name}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            unit = p.discounted_price if p.discounted_price is not None else p.price
            line_total = (Decimal(unit) * qty).quantize(Decimal("0.01"))
            subtotal += line_total
            items.append(
                {
                    "product_id": str(p.id),
                    "name": p.name,
                    "quantity": qty,
                    "unit_price": str(unit),
                    "subtotal": str(line_total),
                }
            )
        fee_pct = Decimal(getattr(settings, "PLATFORM_MARKETPLACE_FEE_PERCENT", 10)) / Decimal(100)
        platform_fee = (subtotal * fee_pct).quantize(Decimal("0.01"))
        total = (subtotal + platform_fee).quantize(Decimal("0.01"))
        otp = get_random_string(6, allowed_chars="0123456789")
        with transaction.atomic():
            order = Order.objects.create(
                order_number=generate_order_number(),
                user=request.user,
                vendor=vendor,
                items=items,
                subtotal=subtotal,
                platform_fee=platform_fee,
                total_amount=total,
                status="paid",
                pickup_type=pickup_type,
                pickup_otp=otp,
            )
            for p in products:
                q = qty_map[str(p.id)]
                Product.objects.filter(pk=p.pk).update(stock_quantity=F("stock_quantity") - q)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
