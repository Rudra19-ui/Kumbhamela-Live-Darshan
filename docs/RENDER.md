# Host KumbhConnect on [Render](https://render.com) — **free Hobby tier**

Use a **free Hobby workspace** ([Render free tier](https://render.com/docs/free)): free Web Service, free Postgres, and free Key Value (Redis-compatible). No paid plan is required for that stack.

**Limits you should know:** free web services **spin down after ~15 min idle** (first request after idle can take ~1 min), free Postgres **expires after 30 days** unless you upgrade, and free Key Value is **in-memory** (data cleared on restart). Fine for demos; not for serious production.

---

## Free tier (manual) — no Blueprint

Do this in the [Render Dashboard](https://dashboard.render.com/) if Blueprint asks for a paid plan or you prefer clicking through the UI.

### 1. PostgreSQL (free)

1. **New** → **PostgreSQL**.
2. Instance type: **Free** (only **one** free Postgres per workspace).
3. Create. Copy the **Internal Database URL** (starts with `postgresql://`).

### 2. Key Value / Redis (free)

1. **New** → **Key Value**.
2. Instance type: **Free** (only **one** free KV per workspace).
3. **Inbound IP rules:** choose **“Only internal connections”** (or allow `0.0.0.0/0` only if Render forces you — internal is safer).
4. Create. Copy the **Internal Redis URL** (starts with `redis://`).

### 3. Web service (free)

1. **New** → **Web Service** → connect **this** GitHub repo.
2. **Runtime:** **Docker** (free tier supports Docker; see [Deploy for Free](https://render.com/docs/free)).
3. **Dockerfile path:** `./Dockerfile`
4. **Instance type:** **Free**
5. **Health check path:** `/healthz`
6. **Environment** → add:

| Key | Value |
|-----|--------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `SECRET_KEY` | Long random string (generator or `openssl rand -hex 32`) |
| `DATABASE_URL` | Paste **Internal Database URL** from step 1 (or use **Link** if Render offers it). |
| `REDIS_URL` | Paste **Internal Redis URL** from step 2. |
| `ENABLE_DEV_LOGIN` | `0` |
| `SKIP_PAYMENT_CONFIRMATION` | `0` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated HTTPS origins for browser admins, e.g. `https://myadmin.vercel.app` — or `https://example.com` if you only use the Expo app with JWT. |

Production settings read **`RENDER_EXTERNAL_URL`** automatically for **`ALLOWED_HOSTS`** / **`CSRF_TRUSTED_ORIGINS`**.

7. **Create Web Service** and wait for the first deploy. Open **`https://<your-service-name>.onrender.com/healthz`** → should return `ok`.

### 4. Mobile app

In `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://<your-service-name>.onrender.com
```

Use **`https://`**. Restart Expo after changing env.

---

## Blueprint (optional, all free)

If your workspace allows it:

1. **New** → **Blueprint** → connect repo → select **`render.yaml`**.
2. The file uses **`plan: free`** for web, Postgres, and Key Value.
3. If Render still asks for payment, use the **manual** steps above — some accounts or regions only expose paid types in Blueprint.

---

## Docker on Render

Migrations and `collectstatic` run on each deploy via **`scripts/render-start.sh`**. Gunicorn listens on **`PORT`**.

---

## Celery

The web service does **not** run Celery. Free **Background Workers** may not be available; for a demo API you can rely on **`CELERY_TASK_ALWAYS_EAGER`** only if you add that in settings (not enabled in this repo’s production by default). For real queues, upgrade or run workers elsewhere.

---

## Security

- Keep **`ENABLE_DEV_LOGIN=0`** on the public internet.
- Set strong **`SECRET_KEY`** and **`QR_HMAC_SECRET`** in the Render dashboard.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Build / deploy asks for paid plan | Use **manual** free Postgres + free Key Value + **Free** web (Docker), or try another region / account per [free tier docs](https://render.com/docs/free). |
| 502 / boot crash | **Logs** tab. Confirm `DATABASE_URL` and `REDIS_URL` are the **internal** URLs and the DB/KV exist in the **same region** as the web service when possible. |
| Slow first request | Normal on **free** after idle spin-down (~1 min). |
| Postgres “expired” | Free DB expires after **30 days**; upgrade or export data before that. |
