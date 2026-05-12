from rest_framework import serializers

from .models import Order, Product, VendorProfile


class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = (
            "id",
            "shop_name",
            "shop_name_hindi",
            "description",
            "category",
            "logo_url",
            "banner_url",
            "stall_location",
            "latitude",
            "longitude",
            "rating",
            "total_reviews",
            "is_approved",
        )


class ProductSerializer(serializers.ModelSerializer):
    vendor = VendorProfileSerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "vendor",
            "name",
            "name_hindi",
            "description",
            "category",
            "price",
            "discounted_price",
            "stock_quantity",
            "unit",
            "images",
            "tags",
            "is_active",
        )


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "vendor",
            "items",
            "subtotal",
            "platform_fee",
            "total_amount",
            "status",
            "pickup_type",
            "pickup_slot",
            "pickup_otp",
            "created_at",
        )


class CheckoutLineSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CheckoutDevSerializer(serializers.Serializer):
    pickup_type = serializers.ChoiceField(
        choices=["self_pickup", "stall_delivery"],
        default="self_pickup",
    )
    lines = CheckoutLineSerializer(many=True)
