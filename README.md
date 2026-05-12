# KumbhConnect (कुंभ कनेक्ट) — Backend foundation

This repository contains a **Phase-1 production-oriented Django 4.2 + DRF** backend for the KumbhConnect platform: domain models aligned with your specification, JWT auth with phone OTP (Twilio optional), Razorpay order creation + signed webhooks, Redis slot locks, QR HMAC utilities, OpenAPI docs, Docker Compose, and seed data.

The full specification (React Native, Next.js, Vite admin/pundit/vendor apps, IVS/Agora, exhaustive admin APIs) is **not** fully implemented in this repo; use this backend as the source of truth to grow those clients against `/api/v1/`.

## Quick start (Windows / local)

1. Python 3.12+, Redis (optional for OTP rate limits; use Docker or install locally).
2. Copy `.env.example` to `.env` and set at least `SECRET_KEY`.
3. For a **local SQLite** database (no PostgreSQL):

   ```powershell
   $env:USE_SQLITE="1"
   $env:DJANGO_SETTINGS_MODULE="config.settings.development"
   python -m pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_kumbh
   python manage.py runserver
   ```

4. API docs: `http://127.0.0.1:8000/api/docs/`
5. Admin: `http://127.0.0.1:8000/admin/` — seed creates superuser **phone `9999999999`**, password **`changeme`**.

## Docker (PostgreSQL + Redis + web + Celery + Nginx)

```bash
cp .env.example .env
# Remove USE_SQLITE from .env for compose; set DB_HOST=db, REDIS_URL=redis://redis:6379/0
docker compose up --build
```

## Deploy on Render (free Hobby tier)

No paid plan required for a **free** Web + **free** Postgres + **free** Key Value stack. Follow **`docs/RENDER.md`** (manual steps first). Optional **`render.yaml`** Blueprint uses **`plan: free`** if your workspace allows it.

## Implemented API surface (prefix `/api/v1/`)

| Area | Routes |
|------|--------|
| Auth | `auth/send-otp/`, `auth/verify-otp/`, `auth/register/`, `auth/token/refresh/`, `auth/logout/`, `auth/me/`, `auth/me/fcm-token/` |
| Poojas | `poojas/categories/`, `poojas/offerings/`, `poojas/offerings/<id>/` |
| Pundits | `pundits/`, `pundits/<id>/` |
| Bookings | `bookings/slots/`, `bookings/`, `bookings/<id>/`, `bookings/scan-qr/` |
| Streams | `streams/feeds/`, `streams/feeds/<id>/`, `streams/schedules/`, `streams/vip-bookings/` |
| Marketplace | `marketplace/products/`, `marketplace/vendors/`, `marketplace/orders/` |
| Payments | `payments/verify/`, `payments/history/`, `payments/razorpay-webhook/` |
| Notifications | `notifications/`, `notifications/mark-read/`, `notifications/unread-count/` |
| Admin (JWT admin role) | `admin/dashboard/stats/`, `admin/users/summary/` |

Extend remaining admin/pundit/vendor endpoints by following the same patterns in `apps/*/views.py`.

## Celery

```powershell
celery -A config worker -l info
```

OTP SMS uses `send_otp_sms` when Twilio env vars are set; otherwise OTP is **logged** in development.

## Licence

Proprietary — KumbhConnect internal use unless you add a licence.
