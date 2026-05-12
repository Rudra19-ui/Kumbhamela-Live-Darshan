from django.urls import path

from . import views

urlpatterns = [
    path("announcements/", views.AnnouncementListView.as_view(), name="announcements-list"),
    path("", views.NotificationListView.as_view(), name="notifications-list"),
    path("mark-read/", views.NotificationMarkReadView.as_view(), name="notifications-mark-read"),
    path("unread-count/", views.NotificationUnreadCountView.as_view(), name="notifications-unread"),
]
