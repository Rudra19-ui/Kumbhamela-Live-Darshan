from django.urls import path

from . import views

urlpatterns = [
    path("products/", views.ProductListView.as_view(), name="marketplace-products"),
    path("products/<uuid:pk>/", views.ProductDetailView.as_view(), name="marketplace-product-detail"),
    path("vendors/", views.VendorListView.as_view(), name="marketplace-vendors"),
    path("vendors/<uuid:pk>/", views.VendorDetailView.as_view(), name="marketplace-vendor-detail"),
    path("orders/checkout-dev/", views.CheckoutDevView.as_view(), name="marketplace-checkout-dev"),
    path("orders/", views.OrderListView.as_view(), name="marketplace-orders"),
    path("orders/<uuid:pk>/", views.OrderDetailView.as_view(), name="marketplace-order-detail"),
]
