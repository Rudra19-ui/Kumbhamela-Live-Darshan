from django.db.models import Count, Sum
from django.urls import path
from django.utils import timezone
from rest_framework import permissions, views
from rest_framework.response import Response

from apps.bookings.models import PoojaBooking
from apps.live_stream.models import CameraFeed
from apps.marketplace.models import Order
from apps.payments.models import Payment
from apps.accounts.models import User


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (getattr(u, "role", None) == "admin" or u.is_superuser))


class AdminDashboardStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        bookings_today = PoojaBooking.objects.filter(created_at__date=today).count()
        revenue = (
            Payment.objects.filter(status="success", created_at__date=today).aggregate(s=Sum("amount"))["s"] or 0
        )
        live_streams = CameraFeed.objects.filter(is_live=True).count()
        users = User.objects.filter(is_active=True).count()
        return Response(
            {
                "bookings_today": bookings_today,
                "revenue_today": str(revenue),
                "active_live_streams": live_streams,
                "active_users_total": users,
                "orders_today": Order.objects.filter(created_at__date=today).count(),
            }
        )


class AdminUsersSummaryView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = User.objects.values("role").annotate(c=Count("id")).order_by()
        return Response(list(data))


urlpatterns = [
    path("dashboard/stats/", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
    path("users/summary/", AdminUsersSummaryView.as_view(), name="admin-users-summary"),
]
