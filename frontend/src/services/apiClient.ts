import { authService } from "./authService.ts";

/** Same-origin uses `''` (dev proxy / unified deploy). Set VITE_API_URL or NEXT_PUBLIC_API_URL for split hosting. */
function apiOrigin(): string {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    "";
  return String(raw).replace(/\/$/, "");
}

export function getApiOrigin(): string {
  return apiOrigin();
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await authService.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const origin = apiOrigin();
  const path = endpoint.startsWith("http")
    ? endpoint
    : `${origin}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    throw new Error("Failed to fetch — check NEXT_PUBLIC_API_URL / VITE_API_URL and network.");
  }

  if (response.status === 401) {
    await authService.logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || `Request failed: ${response.status}`);
  }

  return response.json();
}

