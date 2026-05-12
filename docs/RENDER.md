# Host KumbhConnect Django on [Render](https://render.com)

This backend is Docker-ready: migrations and `collectstatic` run on each deploy via `scripts/render-start.sh`. Gunicorn binds to Render’s **`PORT`**.

## Option A — Blueprint (fastest)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Render Dashboard → **New** → **Blueprint**.
3. Connect the repo and select **`render.yaml`** at the repo root.
4. When prompted, set **`CORS_ALLOWED_ORIGINS`** to any browser admin URLs (comma-separated), or a placeholder like `https://example.com` if you only use the mobile app with JWT (Expo does not rely on CORS the same way browsers do).
5. After the first deploy finishes, open **`https://<your-service>.onrender.com/healthz`** — you should see `ok`.
6. API docs: **`https://<your-service>.onrender.com/api/docs/`**

### Celery

The API web process does **not** run Celery workers. For production OTP queues / periodic tasks, add a Render **Background Worker** with the same Docker image and a start command such as:

```bash
celery -A config worker -l info
```

(Optionally add **Celery Beat** as a separate cron or worker command.)

## Option B — Manual Web Service

1. **New** → **Web Service** → connect repo.
2. **Runtime:** Docker; **Dockerfile path:** `./Dockerfile`.
3. **Create** a Render **PostgreSQL** instance and a **Key Value** (Redis) instance.
4. In the web service **Environment** tab, add:
   - `DJANGO_SETTINGS_MODULE` = `config.settings.production`
   - `SECRET_KEY` = long random string (or “Generate” if available)
   - `DATABASE_URL` = *Internal Database URL* from Postgres (Render injects this if you “Link” the database)
   - `REDIS_URL` = internal Redis URL from Key Value
   - `ENABLE_DEV_LOGIN` = `0` (keep dev login **off** on the public internet)
   - `SKIP_PAYMENT_CONFIRMATION` = `0` unless you intentionally run a demo stack

`production` settings automatically append **`RENDER_EXTERNAL_URL`** to **`ALLOWED_HOSTS`** and set **`CSRF_TRUSTED_ORIGINS`** for HTTPS admin.

5. **Health check path:** `/healthz`

## Mobile app (`mobile/.env`)

Set your public API base URL (no trailing slash):

```env
EXPO_PUBLIC_API_URL=https://kumbhconnect-api.onrender.com
```

Use the exact hostname Render assigns. Rebuild or restart Expo so the env is picked up.

**HTTPS:** Render terminates TLS; your app should use **`https://`**, not `http://`, for production.

## Security checklist

- **`ENABLE_DEV_LOGIN=0`** on Render (default in `render.yaml`).
- Set strong **`SECRET_KEY`**, **`QR_HMAC_SECRET`**, and payment/Twilio keys via Render env (use **sync: false** in Blueprint for secrets you must not commit).
- Review **`CORS_ALLOWED_ORIGINS`** for any browser frontends.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| 502 / boot crash | Check **Logs**; confirm Postgres + Redis env vars exist. Run `python manage.py migrate` locally against a copy of prod DB if migrations fail. |
| `DisallowedHost` | Should be rare on Render; `RENDER_EXTERNAL_URL` is wired in `production.py`. You can still set **`ALLOWED_HOSTS`** manually. |
| Cold starts (free/starter) | First request after idle can be slow; upgrade plan or use a keep-alive ping. |
