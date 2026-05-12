from django.urls import path

from . import views

urlpatterns = [
    path("", views.PunditListView.as_view(), name="pundit-list"),
    path("<uuid:pk>/slots/", views.PunditSlotListView.as_view(), name="pundit-slots"),
    path("<uuid:pk>/", views.PunditDetailView.as_view(), name="pundit-detail"),
]
