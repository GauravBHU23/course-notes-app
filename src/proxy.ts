import { NextRequest, NextResponse } from "next/server";
import { decodeSessionCookie, APP_SESSION_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/auth/cookies";
import { validateSession, touchSession } from "@/lib/auth/session";

const STUDENT_PROTECTED_PREFIX = "/dashboard";
const ADMIN_PROTECTED_PREFIX = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith(ADMIN_PROTECTED_PREFIX) && pathname !== ADMIN_LOGIN_PATH) {
    return guardRoute(req, ADMIN_SESSION_COOKIE, "/admin/login");
  }

  if (pathname.startsWith(STUDENT_PROTECTED_PREFIX)) {
    return guardRoute(req, APP_SESSION_COOKIE, "/login");
  }

  return NextResponse.next();
}

async function guardRoute(req: NextRequest, cookieName: string, redirectTo: string) {
  const raw = req.cookies.get(cookieName)?.value;
  const payload = decodeSessionCookie(raw);

  const result = await validateSession(payload);

  if (!result.valid) {
    const url = req.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.set("reason", result.reason === "no_cookie" ? "not_logged_in" : "session_ended");
    const response = NextResponse.redirect(url);
    response.cookies.delete(cookieName);
    return response;
  }

  if (payload) {
    // Best-effort; failures here should never block the request.
    touchSession(payload.sessionId).catch(() => {});
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
