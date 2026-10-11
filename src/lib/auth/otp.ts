import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOtpEmail } from "@/lib/email/resend";
import { smsProvider } from "@/lib/sms/provider";

export type OtpChannel = "email" | "sms";
export type OtpPurpose = "login" | "signup" | "password_reset";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHmac("sha256", process.env.OTP_SECRET!).update(code).digest("hex");
}

function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export interface SendOtpResult {
  ok: boolean;
  message: string;
}

export async function sendOtp(
  identifier: string,
  channel: OtpChannel,
  purpose: OtpPurpose
): Promise<SendOtpResult> {
  if (channel === "sms" && !smsProvider.isConfigured()) {
    return {
      ok: false,
      message: "Mobile OTP coming soon. Please use email OTP or password login.",
    };
  }

  const code = generateCode();
  const supabase = createAdminClient();

  await supabase.from("otp_codes").insert({
    identifier,
    channel,
    purpose,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + OTP_EXPIRY_MS).toISOString(),
  });

  if (channel === "email") {
    await sendOtpEmail(identifier, code);
  } else {
    await smsProvider.send(identifier, `Your OTP is ${code}. Valid for 5 minutes. Do not share it.`);
  }

  return { ok: true, message: `OTP sent via ${channel}.` };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "mismatch" };

export async function verifyOtp(
  identifier: string,
  code: string,
  purpose: OtpPurpose
): Promise<VerifyOtpResult> {
  const supabase = createAdminClient();

  const { data: otpRow } = await supabase
    .from("otp_codes")
    .select("id, code_hash, expires_at, consumed_at, attempt_count")
    .eq("identifier", identifier)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otpRow) return { ok: false, reason: "not_found" };
  if (otpRow.attempt_count >= MAX_VERIFY_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
  if (new Date(otpRow.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };

  const providedHash = hashCode(code);
  const expectedHash = otpRow.code_hash;
  const matches =
    providedHash.length === expectedHash.length &&
    timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));

  if (!matches) {
    await supabase
      .from("otp_codes")
      .update({ attempt_count: otpRow.attempt_count + 1 })
      .eq("id", otpRow.id);
    return { ok: false, reason: "mismatch" };
  }

  await supabase.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", otpRow.id);
  return { ok: true };
}
