from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "phone",
            "email",
            "full_name",
            "profile_picture_url",
            "role",
            "is_verified",
            "preferred_language",
            "fcm_token",
            "created_at",
        )
        read_only_fields = ("id", "phone", "role", "is_verified", "created_at")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "full_name", "profile_picture_url", "preferred_language")


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    purpose = serializers.ChoiceField(choices=["login", "register", "reset"], default="login")


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=["login", "register", "reset"], default="login")


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("full_name", "email", "profile_picture_url", "preferred_language")


class FCMSerializer(serializers.Serializer):
    fcm_token = serializers.CharField()


class DevLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    full_name = serializers.CharField(max_length=255, required=False, default="Bhakt")
