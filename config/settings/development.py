import os

from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

AUTH_PASSWORD_VALIDATORS = []

CELERY_TASK_ALWAYS_EAGER = os.environ.get("CELERY_EAGER", "0") == "1"
CELERY_TASK_EAGER_PROPAGATES = True

if os.environ.get("USE_SQLITE", "").lower() in ("1", "true", "yes"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Dev-only: mobile app can obtain JWT without OTP; confirm bookings/orders without Razorpay.
ENABLE_DEV_LOGIN = os.environ.get("ENABLE_DEV_LOGIN", "1").lower() in ("1", "true", "yes")
SKIP_PAYMENT_CONFIRMATION = os.environ.get("SKIP_PAYMENT_CONFIRMATION", "1").lower() in ("1", "true", "yes")
