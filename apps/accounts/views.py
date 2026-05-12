from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenBlacklistView

from .models import User
from .serializers import (
    DevLoginSerializer,
    FCMSerializer,
    RegisterSerializer,
    SendOTPSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .services import send_otp, verify_otp


class DevLoginView(views.APIView):
    """Obtain JWT without OTP when ENABLE_DEV_LOGIN is true (local / staging only)."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(request=DevLoginSerializer)
    def post(self, request):
        if not getattr(settings, "ENABLE_DEV_LOGIN", False):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = DevLoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        phone = "".join(c for c in ser.validated_data["phone"] if c.isdigit())
        if len(phone) == 12 and phone.startswith("91"):
            phone = phone[2:]
        if len(phone) != 10:
            return Response({"detail": "Use a 10-digit Indian mobile number."}, status=status.HTTP_400_BAD_REQUEST)
        full_name = ser.validated_data.get("full_name") or "Bhakt"
        user, _ = User.objects.get_or_create(
            phone=phone,
            defaults={"full_name": full_name, "role": "devotee", "is_verified": True},
        )
        if user.full_name != full_name and request.data.get("full_name"):
            user.full_name = full_name
            user.save(update_fields=["full_name"])
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class SendOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=SendOTPSerializer, responses={200: None})
    def post(self, request):
        ser = SendOTPSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        send_otp(ser.validated_data["phone"], ser.validated_data.get("purpose", "login"))
        return Response({"detail": "OTP sent."}, status=status.HTTP_200_OK)


class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=VerifyOTPSerializer)
    def post(self, request):
        ser = VerifyOTPSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = verify_otp(
            ser.validated_data["phone"],
            ser.validated_data["otp"],
            ser.validated_data.get("purpose", "login"),
        )
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=RegisterSerializer, responses={200: UserSerializer})
    def post(self, request):
        ser = RegisterSerializer(data=request.data, instance=request.user, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        ser = UserProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(UserSerializer(request.user).data)


class FCMTokenView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = FCMSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        request.user.fcm_token = ser.validated_data["fcm_token"]
        request.user.save(update_fields=["fcm_token"])
        return Response({"detail": "FCM token saved."})


class LogoutView(TokenBlacklistView):
    permission_classes = [permissions.AllowAny]
