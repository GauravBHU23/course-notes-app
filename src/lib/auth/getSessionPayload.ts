import "server-only";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decodeSessionCookie, APP_SESSION_COOKIE, ADMIN_SESSION_COOKIE, type AppSessionCookiePayload } from "@/lib/auth/cookies";

export const MOBILE_SESSION_HEADER = "x-app-session";
export const MOBILE_ADMIN_SESSION_HEADER = "x-admin-session";

/**
 * Reads the app-level session payload from either the web cookie or the
 * mobile app's custom header, so API routes serve both clients identically
 * without duplicating logic. The mobile app has no cookie jar for our own
 * cookies (only Supabase's own session, stored separately) -- it sends the
 * same base64url-encoded {userId, sessionId, sessionVersion} payload that
 * setSessionCookie() would otherwise write, via the x-app-session /
 * x-admin-session header instead.
 *
 * Cookie takes precedence when both are present (shouldn't happen in
 * practice -- a request is either from the web app or the mobile app, not
 * both -- but cookie-first keeps web behavior byte-for-byte unchanged).
 */
export async function getSessionPayload(
  req: NextRequest,
  role: "student" | "admin" = "student"
): Promise<AppSessionCookiePayload | null> {
  const cookieStore = await cookies();
  const cookieName = role === "admin" ? ADMIN_SESSION_COOKIE : APP_SESSION_COOKIE;
  const cookieValue = cookieStore.get(cookieName)?.value ?? req.cookies.get(cookieName)?.value;
  const fromCookie = decodeSessionCookie(cookieValue);
  if (fromCookie) return fromCookie;

  const headerName = role === "admin" ? MOBILE_ADMIN_SESSION_HEADER : MOBILE_SESSION_HEADER;
  const fromHeader = decodeSessionCookie(req.headers.get(headerName));
  return fromHeader;
}
