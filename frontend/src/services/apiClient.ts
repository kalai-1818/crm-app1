import { authService } from "./authService.ts";

/**
 * Resolved API origin (Railway URL in split deploy). Same-origin SPA+API bundles may leave this empty — allowed only in development.
 * In production builds, missing base URL fails fast so Vercel never silently calls ` /api` on the wrong host.
 */
export function getApiBaseUrl(): string {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    "";
  return String(raw).trim().replace(/\/$/, "");
}

export function getApiOrigin(): string {
  return getApiBaseUrl();
}

/**
 * Split deploy (Vercel UI + Railway API) requires an absolute API origin.
 * Unified deploy on Railway (SPA + `/api` on the same origin) omits env and uses relative `/api/…`.
 */
function assertProductionApiBase(): void {
  if (!import.meta.env.PROD) return;
  if (getApiBaseUrl()) return;
  if (typeof window === "undefined") return;
  const host = window.location.hostname.toLowerCase();
  const isVercel = host === "vercel.app" || host.endsWith(".vercel.app");
  if (!isVercel) return;
  const msg =
    "Missing VITE_API_URL or NEXT_PUBLIC_API_URL on this Vercel deployment. Add your Railway public URL (no trailing slash), save, redeploy.";
  console.error("[apiClient]", msg);
  throw new Error(msg);
}

function buildRequestUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) return endpoint;
  assertProductionApiBase();
  const base = getApiBaseUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await authService.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = buildRequestUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    console.error("[apiClient] fetch failed", url, err);
    throw new Error(
      `Failed to fetch ${url}. Check VITE_API_URL / NEXT_PUBLIC_API_URL, CORS on Railway, and that the backend is online.`,
    );
  }

  if (response.status === 401) {
    await authService.logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = (data as { message?: string }).message || `Request failed: ${response.status}`;
    console.error("[apiClient] HTTP error", response.status, url, message);
    throw new Error(message);
  }

  return response.json();
}
