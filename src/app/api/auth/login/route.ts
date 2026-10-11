import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { checkAndClearLockout, recordFailedAttempt, resetFailedAttempts, logLoginAttempt, LOCKOUT_MAX_ATTEMPTS } from "@/lib/auth/lockout";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { passwordLoginSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = passwordLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier, password } = parsed.data;
  const userAgent = req.headers.get("user-agent");

  const profile = await resolveIdentifierToProfile(identifier);
  if (!profile) {
    await logLoginAttempt({ identifier, success: false, ipAddress: ip, userAgent });
    return NextResponse.json({ error: "Invalid email/mobile or password." }, { status: 401 });
  }

  const lockoutStatus = await checkAndClearLockout(profile.id);
  if (lockoutStatus.locked) {
    await logLoginAttempt({ identifier, success: false, ipAddress: ip, userAgent });
    return NextResponse.json(
      { error: "Account locked due to too many failed attempts.", remainingSeconds: lockoutStatus.remainingSeconds },
      { status: 423 }
    );
  }

  // Use the cookie-aware server client (not the throwaway anon client) so
  // Supabase's own auth session actually reaches the browser as cookies --
  // without this, the browser-side realtime subscription in SessionGuard
  // has no JWT to authorize its RLS-gated channel with, and the instant
  // force-logout broadcast silently never arrives (the per-request session
  // check in proxy.ts still catches it on the next navigation regardless,
  // but the "kick an already-open idle tab immediately" UX requires this).
  const supabase = await createServerSupabaseClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (authError) {
    const result = await recordFailedAttempt(profile.id);
    await logLoginAttempt({ identifier, success: false, ipAddress: ip, userAgent });

    if (result.justLocked) {
      return NextResponse.json(
        { error: "Account locked due to too many failed attempts.", remainingSeconds: result.remainingSeconds },
        { status: 423 }
      );
    }
    return NextResponse.json(
      {
        error: "Invalid email/mobile or password.",
        attemptsRemaining: LOCKOUT_MAX_ATTEMPTS - result.attempts,
      },
      { status: 401 }
    );
  }

  await resetFailedAttempts(profile.id);
  await logLoginAttempt({ identifier, success: true, ipAddress: ip, userAgent });

  const { cookiePayload } = await createSession({ userId: profile.id, ipAddress: ip, userAgent });

  const cookieStore = await cookies();
  setSessionCookie(cookieStore, profile.role === "admin" ? "admin" : "student", cookiePayload);

  return NextResponse.json({ ok: true, role: profile.role });
}
