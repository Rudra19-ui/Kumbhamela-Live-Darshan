from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("dev-login/", views.DevLoginView.as_view(), name="auth-dev-login"),
    path("send-otp/", views.SendOTPView.as_view(), name="auth-send-otp"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="auth-verify-otp"),
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("me/", views.MeView.as_view(), name="auth-me"),
    path("me/fcm-token/", views.FCMTokenView.as_view(), name="auth-fcm"),
]
