import { API_BASE } from "../config";
import { useAuthStore } from "../store/authStore";

export type ApiInit = RequestInit & { timeoutMs?: number };

export async function api<T = unknown>(path: string, init?: ApiInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const timeoutMs = init?.timeoutMs;
  const { timeoutMs: _omit, signal: userSignal, ...fetchInit } = init ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchInit.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const ac = new AbortController();
  const timeoutId =
    timeoutMs && timeoutMs > 0 ? setTimeout(() => ac.abort(), timeoutMs) : undefined;
  const signal = timeoutMs && timeoutMs > 0 ? ac.signal : userSignal;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...fetchInit, headers, signal });
  } catch (e) {
    if (e instanceof Error && (e.name === "AbortError" || /aborted/i.test(e.message))) {
      throw new Error(
        `No response after ${Math.round((timeoutMs ?? 0) / 1000)}s. ` +
          `Check Django is running and mobile/.env has EXPO_PUBLIC_API_URL = your PC's Wi‑Fi IP (same network). ` +
          `Now: ${API_BASE}`,
      );
    }
    if (e instanceof Error && e.message === "Network request failed") {
      throw new Error(
        `Cannot reach ${API_BASE}. ` +
          `On a phone, use your computer's LAN address (not localhost). ` +
          `Run: python manage.py runserver 0.0.0.0:8000`,
      );
    }
    throw e instanceof Error ? e : new Error(String(e));
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    let msg =
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : res.statusText;
    const raw = typeof data === "string" ? data : "";
    if (raw.includes("DisallowedHost")) {
      msg =
        `Django rejected the Host header for ${API_BASE}. ` +
        `Add your PC's LAN IP to ALLOWED_HOSTS or LAN_ALLOWED_HOSTS in the backend .env ` +
        `(Gunicorn/Docker use production settings, which only allow localhost by default).`;
    }
    if (res.status === 404 && path.includes("dev-login")) {
      msg = `${msg} — Wrong server or dev login off. This app needs Kumbh Django at /api/v1/… on ${API_BASE} (not another project on :8000).`;
    }
    const err = new Error(msg);
    (err as Error & { status?: number; data?: unknown }).status = res.status;
    (err as Error & { data?: unknown }).data = data;
    throw err;
  }
  return data as T;
}
