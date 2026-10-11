import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSessionCookie, clearSessionCookie, APP_SESSION_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/auth/cookies";
import { revokeSession } from "@/lib/auth/session";

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();

  const studentPayload = decodeSessionCookie(cookieStore.get(APP_SESSION_COOKIE)?.value);
  if (studentPayload) {
    await revokeSession(studentPayload.sessionId, "logout");
    clearSessionCookie(cookieStore, "student");
  }

  const adminPayload = decodeSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (adminPayload) {
    await revokeSession(adminPayload.sessionId, "logout");
    clearSessionCookie(cookieStore, "admin");
  }

  return NextResponse.json({ ok: true });
}
