import { authService } from "./authService.ts";

const API_BASE = import.meta.env.VITE_API_URL || "";

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await authService.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, { ...options, headers });

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

