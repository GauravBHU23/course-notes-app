import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000;

export interface LockoutStatus {
  locked: boolean;
  remainingSeconds: number;
}

/**
 * Checks and, if the previous lock has expired, lazily clears it — no cron
 * job needed. Call this before attempting password/OTP verification.
 */
export async function checkAndClearLockout(profileId: string): Promise<LockoutStatus> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("locked_until")
    .eq("id", profileId)
    .single();

  if (!profile?.locked_until) return { locked: false, remainingSeconds: 0 };

  const lockedUntil = new Date(profile.locked_until).getTime();
  const now = Date.now();

  if (lockedUntil > now) {
    return { locked: true, remainingSeconds: Math.ceil((lockedUntil - now) / 1000) };
  }

  await supabase
    .from("profiles")
    .update({ locked_until: null, failed_login_attempts: 0 })
    .eq("id", profileId);

  return { locked: false, remainingSeconds: 0 };
}

/**
 * Call on a failed password/OTP attempt. Returns the new attempt count and
 * whether this failure just triggered a lock.
 */
export async function recordFailedAttempt(
  profileId: string
): Promise<{ attempts: number; justLocked: boolean; remainingSeconds: number }> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("failed_login_attempts")
    .eq("id", profileId)
    .single();

  const nextAttempts = (profile?.failed_login_attempts ?? 0) + 1;
  const justLocked = nextAttempts >= MAX_ATTEMPTS;

  await supabase
    .from("profiles")
    .update({
      failed_login_attempts: nextAttempts,
      locked_until: justLocked ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null,
    })
    .eq("id", profileId);

  return {
    attempts: nextAttempts,
    justLocked,
    remainingSeconds: justLocked ? LOCK_DURATION_MS / 1000 : 0,
  };
}

export async function resetFailedAttempts(profileId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ failed_login_attempts: 0, locked_until: null })
    .eq("id", profileId);
}

export async function logLoginAttempt(params: {
  identifier: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
}) {
  const supabase = createAdminClient();
  await supabase.from("login_attempts").insert({
    identifier: params.identifier,
    success: params.success,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });
}

export const LOCKOUT_MAX_ATTEMPTS = MAX_ATTEMPTS;
