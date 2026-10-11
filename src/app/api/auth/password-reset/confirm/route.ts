import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveIdentifierToProfile } from "@/lib/auth/resolveIdentifier";
import { verifyOtp } from "@/lib/auth/otp";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokeAllSessionsForUser } from "@/lib/auth/session";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";

const bodySchema = z.object({
  identifier: z.string().trim().min(3),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(72),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`pwreset-confirm:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { identifier, code, newPassword } = parsed.data;

  const otpResult = await verifyOtp(identifier, code, "password_reset");
  if (!otpResult.ok) {
    const messages: Record<string, string> = {
      not_found: "No reset code was requested for this account. Please request a new one.",
      expired: "This code has expired. Please request a new one.",
      too_many_attempts: "Too many incorrect attempts. Please request a new code.",
      mismatch: "Incorrect code.",
    };
    return NextResponse.json({ error: messages[otpResult.reason] }, { status: 400 });
  }

  const profile = await resolveIdentifierToProfile(identifier);
  if (!profile) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }

  // A password reset invalidates any existing session for this account, the
  // same way "someone else knows your old password" would be treated --
  // force every device to log in again with the new password.
  await revokeAllSessionsForUser(profile.id, "admin_revoked");

  return NextResponse.json({ ok: true });
}
