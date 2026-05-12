import random
import re
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, Throttled, ValidationError

from .models import OTPSession, User
from .tasks import send_otp_sms

OTP_EXPIRY_MINUTES = 5
OTP_MAX_ATTEMPTS = 3
OTP_SENDS_PER_HOUR = 3
LOCKOUT_MINUTES = 30


def _normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        return digits
    if len(digits) == 12 and digits.startswith("91"):
        return digits[2:]
    if len(digits) == 13 and digits.startswith("091"):
        return digits[3:]
    raise ValidationError({"phone": "Enter a valid 10-digit Indian mobile number."})


def _rate_key(phone: str) -> str:
    return f"otp_rate:{phone}"


def _lock_key(phone: str) -> str:
    return f"otp_lock:{phone}"


def send_otp(phone: str, purpose: str = "login") -> None:
    phone = _normalize_phone(phone)
    if cache.get(_lock_key(phone)):
        raise PermissionDenied("Too many failed attempts. Try again after 30 minutes.")

    rk = _rate_key(phone)
    count = cache.get(rk, 0)
    if count >= OTP_SENDS_PER_HOUR:
        raise Throttled(detail="OTP request limit reached for this hour.")

    otp = f"{random.randint(0, 999999):06d}"
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    with transaction.atomic():
        OTPSession.objects.filter(phone=phone, purpose=purpose, is_used=False).update(is_used=True)
        OTPSession.objects.create(
            phone=phone,
            otp_hash=make_password(otp),
            purpose=purpose,
            expires_at=expires_at,
        )

    cache.set(rk, count + 1, timeout=3600)
    send_otp_sms.delay(phone, otp)


def verify_otp(phone: str, otp: str, purpose: str = "login") -> User:
    phone = _normalize_phone(phone)
    if cache.get(_lock_key(phone)):
        raise PermissionDenied("Account temporarily locked due to failed OTP attempts.")

    session = (
        OTPSession.objects.filter(phone=phone, purpose=purpose, is_used=False)
        .order_by("-created_at")
        .first()
    )
    if not session or session.expires_at < timezone.now():
        raise ValidationError({"otp": "OTP expired or not found. Request a new code."})

    if not check_password(otp, session.otp_hash):
        session.attempts += 1
        session.save(update_fields=["attempts"])
        if session.attempts >= OTP_MAX_ATTEMPTS:
            cache.set(_lock_key(phone), 1, timeout=LOCKOUT_MINUTES * 60)
        raise ValidationError({"otp": "Invalid OTP."})

    session.is_used = True
    session.save(update_fields=["is_used"])

    user, _ = User.objects.get_or_create(
        phone=phone,
        defaults={"full_name": "Devotee", "role": "devotee"},
    )
    user.is_verified = True
    user.save(update_fields=["is_verified"])
    return user
