import { NextRequest, NextResponse } from "next/server";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { checkAndClearLockout } from "@/lib/auth/lockout";
import { sendOtp } from "@/lib/auth/otp";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { otpSendSchema, isEmailIdentifier } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`otp-send:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many OTP requests. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = otpSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier, purpose } = parsed.data;

  if (!rateLimit(`otp-send:${identifier}`, 3, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many OTP requests for this account. Please wait a few minutes." }, { status: 429 });
  }

  if (purpose === "login") {
    const profile = await resolveIdentifierToProfile(identifier);
    if (!profile) {
      // Do not reveal whether the account exists.
      return NextResponse.json({ ok: true, message: "If this account exists, an OTP has been sent." });
    }
    const lockoutStatus = await checkAndClearLockout(profile.id);
    if (lockoutStatus.locked) {
      return NextResponse.json(
        { error: "Account locked due to too many failed attempts.", remainingSeconds: lockoutStatus.remainingSeconds },
        { status: 423 }
      );
    }
  }

  const channel = isEmailIdentifier(identifier) ? "email" : "sms";
  const result = await sendOtp(identifier, channel, purpose);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: result.message, channel });
}
