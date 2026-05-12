from django.urls import path

from . import views

urlpatterns = [
    path("feeds/", views.CameraFeedListView.as_view(), name="stream-feeds"),
    path("feeds/<uuid:pk>/", views.CameraFeedDetailView.as_view(), name="stream-feed-detail"),
    path("schedules/", views.DarshanScheduleListView.as_view(), name="stream-schedules"),
    path("vip-bookings/", views.VIPDarshanListCreateView.as_view(), name="stream-vip-bookings"),
]
