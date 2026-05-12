import os
from urllib.parse import urlparse

import dj_database_url
from .base import *  # noqa: F403

DEBUG = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Render Postgres (and others) expose DATABASE_URL.
if os.environ.get("DATABASE_URL"):
    DATABASES["default"] = dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    )

# Gunicorn/Docker use this module; base ALLOWED_HOSTS is often only localhost.
# Expo / physical phones call http://<PC-LAN-IP>:8000 → Host header is that IP.
# Add your Wi‑Fi IPv4 to .env as either ALLOWED_HOSTS=...,192.168.x.x or:
_lan_extra = [h.strip() for h in os.environ.get("LAN_ALLOWED_HOSTS", "").split(",") if h.strip()]
if _lan_extra:
    ALLOWED_HOSTS = list(dict.fromkeys([*ALLOWED_HOSTS, *_lan_extra]))

# Render.com: public hostname + CSRF for HTTPS admin / forms.
_render_url = os.environ.get("RENDER_EXTERNAL_URL", "").strip().rstrip("/")
if _render_url:
    _host = urlparse(_render_url).hostname
    if _host and _host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS = list(dict.fromkeys([*ALLOWED_HOSTS, _host]))
    CSRF_TRUSTED_ORIGINS = [_render_url]
    if _render_url.startswith("http://"):
        CSRF_TRUSTED_ORIGINS.append("https://" + _render_url.removeprefix("http://"))
elif os.environ.get("CSRF_TRUSTED_ORIGINS"):
    CSRF_TRUSTED_ORIGINS = [
        x.strip() for x in os.environ["CSRF_TRUSTED_ORIGINS"].split(",") if x.strip()
    ]
else:
    CSRF_TRUSTED_ORIGINS = []
