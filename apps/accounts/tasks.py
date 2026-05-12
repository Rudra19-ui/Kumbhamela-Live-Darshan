import logging

from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task
def send_otp_sms(phone: str, otp: str) -> None:
    """Send OTP via Twilio when configured; otherwise log (development)."""
    sid = getattr(settings, "TWILIO_ACCOUNT_SID", "") or ""
    token = getattr(settings, "TWILIO_AUTH_TOKEN", "") or ""
    from_num = getattr(settings, "TWILIO_PHONE_NUMBER", "") or ""
    if sid and token and from_num:
        try:
            from twilio.rest import Client

            client = Client(sid, token)
            client.messages.create(
                body=f"Your KumbhConnect OTP is {otp}. Valid for 5 minutes.",
                from_=from_num,
                to=f"+91{phone}",
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Twilio OTP failed: %s", exc)
    else:
        logger.warning("OTP for %s (dev, not sent): %s", phone, otp)
