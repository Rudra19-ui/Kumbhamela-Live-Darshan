import hashlib
import hmac
import secrets
from datetime import date
from typing import Optional

from django.conf import settings


def generate_booking_number(prefix: str = "KB") -> str:
    y = date.today().year
    rand = secrets.token_hex(3).upper()
    return f"{prefix}-{y}-{rand}"


def generate_order_number(prefix: str = "KC") -> str:
    y = date.today().year
    rand = secrets.token_hex(3).upper()
    return f"{prefix}-{y}-{rand}"


def qr_hmac_sign(booking_id: str) -> str:
    secret = getattr(settings, "QR_HMAC_SECRET", settings.SECRET_KEY).encode()
    msg = str(booking_id).encode()
    return hmac.new(secret, msg, hashlib.sha256).hexdigest()


def qr_payload(booking_id) -> str:
    return f"{booking_id}:{qr_hmac_sign(booking_id)}"


def verify_qr_payload(payload: str) -> Optional[str]:
    try:
        bid, sig = payload.split(":", 1)
    except ValueError:
        return None
    if hmac.compare_digest(qr_hmac_sign(bid), sig):
        return bid
    return None


def mask_phone(phone: str) -> str:
    if not phone or len(phone) < 4:
        return "****"
    return f"{'*' * (len(phone) - 4)}{phone[-4:]}"
