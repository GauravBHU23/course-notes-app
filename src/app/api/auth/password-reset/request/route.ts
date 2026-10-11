import { NextRequest, NextResponse } from "next/server";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { sendOtp } from "@/lib/auth/otp";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { otpSendSchema, isEmailIdentifier } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`pwreset-request:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = otpSendSchema.safeParse({ ...body, purpose: "password_reset" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier } = parsed.data;

  if (!rateLimit(`pwreset-request:${identifier}`, 3, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests for this account. Please wait a few minutes." }, { status: 429 });
  }

  const profile = await resolveIdentifierToProfile(identifier);
  if (!profile) {
    return NextResponse.json(
      { error: "No account associated with this email. Please check and try again, or sign up." },
      { status: 404 }
    );
  }

  if (!isEmailIdentifier(identifier)) {
    return NextResponse.json(
      { error: "Password reset via mobile OTP is coming soon. Please use your registered email instead." },
      { status: 400 }
    );
  }

  const result = await sendOtp(identifier, "email", "password_reset");
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "A reset code has been emailed to you." });
}
