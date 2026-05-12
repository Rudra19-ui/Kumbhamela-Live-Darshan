from django.contrib import admin

from .models import OTPSession, RefreshTokenRecord, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("phone", "full_name", "role", "is_verified", "is_active", "is_staff")
    search_fields = ("phone", "full_name", "email")
    ordering = ("-created_at",)
    list_filter = ("role", "is_active", "is_verified")
    readonly_fields = ("created_at", "updated_at", "last_login")

    fieldsets = (
        (None, {"fields": ("phone",)}),
        (
            "Profile",
            {"fields": ("full_name", "email", "profile_picture_url", "role", "preferred_language")},
        ),
        ("Status", {"fields": ("is_active", "is_verified", "is_staff", "is_superuser", "fcm_token")}),
        ("Auth", {"fields": ("last_login",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


admin.site.register(OTPSession)
admin.site.register(RefreshTokenRecord)
