import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { checkAndClearLockout, recordFailedAttempt, resetFailedAttempts, logLoginAttempt, LOCKOUT_MAX_ATTEMPTS } from "@/lib/auth/lockout";
import { sendOtp } from "@/lib/auth/otp";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { passwordLoginSchema, isEmailIdentifier } from "@/lib/utils/validators";

/**
 * Step 1 of admin login: verify password and lockout state, but do NOT
 * create a session yet. On success, emails an OTP and the client must call
 * /api/auth/admin/login-step2 with that code before any session cookie is
 * ever issued. This is a mandatory second factor for admin accounts only
 * -- student login stays single-factor (password or OTP, either one).
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`admin-login-step1:${ip}`, 10, 60_000)) {
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
  if (!profile || profile.role !== "admin") {
    // Same error as a wrong password, so a non-admin account can't be
    // fingerprinted by response differences.
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

  // Deliberately the throwaway anon client, NOT the cookie-aware server
  // client: this only checks the password is correct. Using the
  // cookie-writing client here would set a real Supabase Auth session in
  // the browser on password alone, before the OTP in step 2 -- defeating
  // the point of a mandatory second factor. The real session (needed for
  // the realtime instant-kick subscription) is established in step 2,
  // after the OTP also succeeds; see establishSupabaseSession there.
  const supabase = createAnonClient();
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
      { error: "Invalid email/mobile or password.", attemptsRemaining: LOCKOUT_MAX_ATTEMPTS - result.attempts },
      { status: 401 }
    );
  }

  // Password is correct. Do not reset lockout counters or create a session
  // yet -- that only happens after the OTP in step 2 also succeeds.
  if (!isEmailIdentifier(profile.email)) {
    return NextResponse.json({ error: "Admin account has no valid email on file." }, { status: 400 });
  }

  const otpResult = await sendOtp(profile.email, "email", "login");
  if (!otpResult.ok) {
    return NextResponse.json({ error: otpResult.message }, { status: 500 });
  }

  // Masked email so the UI can show "OTP sent to a***n@example.com"
  // without fully re-exposing the address to a client that only submitted
  // a mobile number as the identifier.
  const [local, domain] = profile.email.split("@");
  const maskedEmail = `${local[0] ?? ""}***${local.length > 1 ? local[local.length - 1] : ""}@${domain}`;

  return NextResponse.json({ ok: true, maskedEmail, identifier: profile.email });
}
