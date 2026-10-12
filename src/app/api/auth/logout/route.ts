import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { revokeSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();

  // getSessionPayload also reads the mobile x-app-session/x-admin-session
  // header, so a mobile client's session gets revoked server-side on
  // logout too -- cookie clearing below is still a no-op for mobile (it
  // has no cookie jar for our cookies), which is expected and harmless.
  const studentPayload = await getSessionPayload(req, "student");
  if (studentPayload) {
    await revokeSession(studentPayload.sessionId, "logout");
    clearSessionCookie(cookieStore, "student");
  }

  const adminPayload = await getSessionPayload(req, "admin");
  if (adminPayload) {
    await revokeSession(adminPayload.sessionId, "logout");
    clearSessionCookie(cookieStore, "admin");
  }

  return NextResponse.json({ ok: true });
}
