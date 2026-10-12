import { getSessionToken } from "@/lib/auth/sessionStorage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the SAME Next.js API routes the website uses (there is no separate
 * mobile backend). Auth is via the x-app-session header instead of a
 * cookie -- see src/lib/auth/getSessionPayload.ts on the web app, which
 * every protected route reads from either source.
 */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; headerRole?: "student" | "admin" } = {}
): Promise<T> {
  const token = await getSessionToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers[options.headerRole === "admin" ? "x-admin-session" : "x-app-session"] = token;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}
