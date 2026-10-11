import "server-only";
import type { NextResponse } from "next/server";
import type { cookies as nextCookies } from "next/headers";

// App-level session cookie, layered on top of Supabase's own auth cookies.
// Carries the session_id + session_version pair our single-session
// enforcement checks on every request. Separate cookie names for the
// student and admin auth flows so the two never collide or get confused.
export const APP_SESSION_COOKIE = "app_session";
export const ADMIN_SESSION_COOKIE = "admin_session";

export interface AppSessionCookiePayload {
  userId: string;
  sessionId: string;
  sessionVersion: number;
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days; server-side check is authoritative anyway

function cookieNameForRole(role: "student" | "admin") {
  return role === "admin" ? ADMIN_SESSION_COOKIE : APP_SESSION_COOKIE;
}

export function encodeSessionCookie(payload: AppSessionCookiePayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeSessionCookie(raw: string | undefined | null): AppSessionCookiePayload | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed?.userId === "string" &&
      typeof parsed?.sessionId === "string" &&
      typeof parsed?.sessionVersion === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

type CookieWriter = Pick<Awaited<ReturnType<typeof nextCookies>>, "set" | "delete"> | NextResponse["cookies"];

export function setSessionCookie(
  writer: CookieWriter,
  role: "student" | "admin",
  payload: AppSessionCookiePayload
) {
  writer.set(cookieNameForRole(role), encodeSessionCookie(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(writer: CookieWriter, role: "student" | "admin") {
  writer.delete(cookieNameForRole(role));
}

export { cookieNameForRole };
