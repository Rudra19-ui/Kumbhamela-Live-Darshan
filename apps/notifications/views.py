from rest_framework import generics, permissions, status, views
from rest_framework.response import Response

from .models import Announcement, Notification
from .serializers import AnnouncementSerializer


class AnnouncementListView(generics.ListAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Announcement.objects.filter(is_active=True).order_by("-created_at")[:20]


class NotificationListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Notification.objects.filter(user=request.user).order_by("-created_at")[:50]
        return Response(
            [
                {
                    "id": str(n.id),
                    "title": n.title,
                    "body": n.body,
                    "type": n.type,
                    "entity_type": n.entity_type,
                    "entity_id": str(n.entity_id) if n.entity_id else None,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                }
                for n in items
            ]
        )


class NotificationMarkReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ids = request.data.get("ids")
        qs = Notification.objects.filter(user=request.user)
        if ids:
            qs = qs.filter(pk__in=ids)
        qs.update(is_read=True)
        return Response({"detail": "Marked read."}, status=status.HTTP_200_OK)


class NotificationUnreadCountView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        c = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread": c})
