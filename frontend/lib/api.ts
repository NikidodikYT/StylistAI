// lib/api.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type LoginResponse = { access_token: string; token_type?: string };

// Храним токен в zustand persist (stylistai-storage)
export function getAccessToken() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("stylistai-storage");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Базовый fetch-обёртка
 * - baseURL
 * - Authorization: Bearer <token> (если есть)
 * - кидает ошибку со status + body
 */
export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  if (res.status === 204) return undefined as any;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as any as T;
}

export async function apiLogin(username: string, password: string) {
  const body = new URLSearchParams({ username, password });

  return apiFetch<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

export async function apiRegister(payload: {
  email: string;
  password: string;
  username: string;
  full_name?: string;
  gender?: string;
  age?: number;
  style_preferences?: string;
  favorite_brands?: string;
}) {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ✅ Реальная загрузка вещи (multipart/form-data) + query params
export async function apiWardrobeUpload(args: {
  file: File;
  category?: string;
  color?: string;
  brand?: string;
  description?: string;
}) {
  const form = new FormData();
  form.append("file", args.file);

  const params = new URLSearchParams();
  if (args.category) params.set("category", args.category);
  if (args.color) params.set("color", args.color);
  if (args.brand) params.set("brand", args.brand);
  if (args.description) params.set("description", args.description);

  const qs = params.toString();
  const url = `/api/v1/wardrobe/upload${qs ? `?${qs}` : ""}`;

  // НЕ ставим Content-Type — fetch сам выставит boundary
  return apiFetch(url, { method: "POST", body: form });
}

// ✅ Чтобы не ловить 307 redirect — используем /wardrobe/ со слэшем
export async function apiWardrobeList(skip = 0, limit = 200) {
  return apiFetch(`/api/v1/wardrobe/?skip=${skip}&limit=${limit}`);
}

export async function apiWardrobeDelete(itemId: number | string) {
  return apiFetch(`/api/v1/wardrobe/${itemId}`, { method: "DELETE" });
}

// compatibility
export async function authFetch(path: string, init: RequestInit = {}) {
  return apiFetch(path, init);
}
