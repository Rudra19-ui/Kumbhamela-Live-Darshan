from django.urls import path

from . import views

urlpatterns = [
    path("slots/", views.PoojaSlotListView.as_view(), name="pooja-slots"),
    path("scan-qr/", views.ScanQRView.as_view(), name="booking-scan-qr"),
    path("", views.BookingListCreateView.as_view(), name="booking-list-create"),
    path(
        "<uuid:pk>/confirm-without-payment/",
        views.BookingConfirmWithoutPaymentView.as_view(),
        name="booking-confirm-dev",
    ),
    path("<uuid:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
]
