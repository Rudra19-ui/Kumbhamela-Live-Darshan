from django.urls import path

from . import views
from .webhooks import razorpay_webhook

urlpatterns = [
    path("verify/", views.PaymentVerifyView.as_view(), name="payment-verify"),
    path("history/", views.PaymentHistoryListView.as_view(), name="payment-history"),
    path("razorpay-webhook/", razorpay_webhook, name="razorpay-webhook"),
]
