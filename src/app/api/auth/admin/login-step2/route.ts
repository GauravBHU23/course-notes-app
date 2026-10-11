import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { verifyOtp } from "@/lib/auth/otp";
import { resetFailedAttempts, logLoginAttempt } from "@/lib/auth/lockout";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { establishSupabaseSession } from "@/lib/auth/establishSupabaseSession";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { otpVerifySchema } from "@/lib/utils/validators";

/**
 * Step 2 of admin login: verify the OTP emailed by step 1. The session
 * cookie -- the only thing that actually grants access to /admin -- is
 * created here, never in step 1, so a correct password alone is never
 * sufficient on its own for an admin account.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`admin-login-step2:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse({ ...body, purpose: "login" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier, code } = parsed.data;
  const userAgent = req.headers.get("user-agent");

  const profile = await resolveIdentifierToProfile(identifier);
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const otpResult = await verifyOtp(identifier, code, "login");
  if (!otpResult.ok) {
    const messages: Record<string, string> = {
      not_found: "No OTP was requested. Please start over.",
      expired: "This OTP has expired. Please start over.",
      too_many_attempts: "Too many incorrect attempts. Please start over.",
      mismatch: "Incorrect OTP.",
    };
    await logLoginAttempt({ identifier, success: false, ipAddress: ip, userAgent });
    return NextResponse.json({ error: messages[otpResult.reason] }, { status: 400 });
  }

  await resetFailedAttempts(profile.id);
  await logLoginAttempt({ identifier, success: true, ipAddress: ip, userAgent });

  // Only now -- after both factors have succeeded -- does the browser get
  // a real Supabase Auth session too (needed for the realtime instant-kick
  // subscription). Doing this in step 1 would leak a valid Supabase session
  // to the browser on password-alone, defeating the point of requiring OTP.
  await establishSupabaseSession(profile.email);

  const { cookiePayload } = await createSession({ userId: profile.id, ipAddress: ip, userAgent });
  const cookieStore = await cookies();
  setSessionCookie(cookieStore, "admin", cookiePayload);

  return NextResponse.json({ ok: true });
}
