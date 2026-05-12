from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.PoojaCategoryListView.as_view(), name="pooja-categories"),
    path("offerings/", views.PoojaOfferingListView.as_view(), name="pooja-offerings"),
    path("offerings/<uuid:pk>/", views.PoojaOfferingDetailView.as_view(), name="pooja-offering-detail"),
]
