import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { checkAndClearLockout, resetFailedAttempts, logLoginAttempt } from "@/lib/auth/lockout";
import { verifyOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { establishSupabaseSession } from "@/lib/auth/establishSupabaseSession";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { otpVerifySchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`otp-verify:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier, code, purpose } = parsed.data;
  const userAgent = req.headers.get("user-agent");

  const otpResult = await verifyOtp(identifier, code, purpose);
  if (!otpResult.ok) {
    const messages: Record<string, string> = {
      not_found: "No OTP was requested for this account. Please request a new one.",
      expired: "This OTP has expired. Please request a new one.",
      too_many_attempts: "Too many incorrect attempts. Please request a new OTP.",
      mismatch: "Incorrect OTP.",
    };
    return NextResponse.json({ error: messages[otpResult.reason] }, { status: 400 });
  }

  if (purpose !== "login") {
    return NextResponse.json({ ok: true });
  }

  const profile = await resolveIdentifierToProfile(identifier);
  if (!profile) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const lockoutStatus = await checkAndClearLockout(profile.id);
  if (lockoutStatus.locked) {
    await logLoginAttempt({ identifier, success: false, ipAddress: ip, userAgent });
    return NextResponse.json(
      { error: "Account locked due to too many failed attempts.", remainingSeconds: lockoutStatus.remainingSeconds },
      { status: 423 }
    );
  }

  await resetFailedAttempts(profile.id);
  await logLoginAttempt({ identifier, success: true, ipAddress: ip, userAgent });

  const supabase = createAdminClient();
  const { data: authUser, error: lookupError } = await supabase.auth.admin.getUserById(profile.id);
  if (lookupError || !authUser?.user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Best-effort: our own session cookie below is the actual access control
  // and must not be blocked by this failing, but without it the browser-side
  // realtime subscription (instant force-logout) silently won't authorize.
  await establishSupabaseSession(profile.email);

  const { cookiePayload } = await createSession({ userId: profile.id, ipAddress: ip, userAgent });
  const cookieStore = await cookies();
  setSessionCookie(cookieStore, profile.role === "admin" ? "admin" : "student", cookiePayload);

  return NextResponse.json({ ok: true, role: profile.role });
}
