import "server-only";
import { UAParser } from "ua-parser-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppSessionCookiePayload } from "@/lib/auth/cookies";

export interface CreateSessionParams {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface CreateSessionResult {
  sessionId: string;
  sessionVersion: number;
  cookiePayload: AppSessionCookiePayload;
}

function deviceLabelFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const browser = result.browser.name ?? "Unknown browser";
  const os = result.os.name ?? "Unknown OS";
  return `${browser} on ${os}`;
}

/**
 * Called after a password/OTP check succeeds. Atomically bumps
 * profiles.session_version, revokes the previous active_sessions row, and
 * inserts the new one. This is the single primitive both the login route
 * and the admin "force logout" action build on.
 */
export async function createSession({
  userId,
  ipAddress,
  userAgent,
}: CreateSessionParams): Promise<CreateSessionResult> {
  const supabase = createAdminClient();

  const { data: newVersion, error: bumpError } = await supabase.rpc("bump_session_version", {
    p_user_id: userId,
  });
  if (bumpError || newVersion === null) {
    throw new Error(`Failed to bump session_version: ${bumpError?.message}`);
  }

  // Revoke any previously live session for this user before inserting the new one.
  await supabase
    .from("active_sessions")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "new_login" })
    .eq("user_id", userId)
    .is("revoked_at", null);

  const { data: session, error: insertError } = await supabase
    .from("active_sessions")
    .insert({
      user_id: userId,
      session_version: newVersion,
      device_label: deviceLabelFromUserAgent(userAgent),
      ip_address: ipAddress,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (insertError || !session) {
    throw new Error(`Failed to create active_sessions row: ${insertError?.message}`);
  }

  await supabase
    .from("profiles")
    .update({ current_session_id: session.id })
    .eq("id", userId);

  // Push an instant force-logout signal to any other open tab/browser for
  // this user. Authoritative enforcement is still the per-request DB check
  // below; this just makes an already-open idle tab react immediately.
  await supabase.channel(`user-session-${userId}`).send({
    type: "broadcast",
    event: "force_logout",
    payload: { newSessionId: session.id },
  });

  return {
    sessionId: session.id,
    sessionVersion: newVersion,
    cookiePayload: { userId, sessionId: session.id, sessionVersion: newVersion },
  };
}

export type SessionCheckResult =
  | { valid: true }
  | { valid: false; reason: "no_cookie" | "version_mismatch" | "revoked" | "not_found" };

/**
 * Authoritative per-request check. Called from middleware and any sensitive
 * API route (PDF token issuance, payment creation, etc). Must hit the DB —
 * cannot be satisfied from the cookie payload alone, since the whole point
 * is detecting that a *different* login has superseded this cookie.
 */
export async function validateSession(payload: AppSessionCookiePayload | null): Promise<SessionCheckResult> {
  if (!payload) return { valid: false, reason: "no_cookie" };

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("session_version")
    .eq("id", payload.userId)
    .single();

  if (error || !profile) return { valid: false, reason: "not_found" };
  if (profile.session_version !== payload.sessionVersion) {
    return { valid: false, reason: "version_mismatch" };
  }

  const { data: session } = await supabase
    .from("active_sessions")
    .select("revoked_at")
    .eq("id", payload.sessionId)
    .single();

  if (!session) return { valid: false, reason: "not_found" };
  if (session.revoked_at) return { valid: false, reason: "revoked" };

  return { valid: true };
}

export async function touchSession(sessionId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("active_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function revokeSession(sessionId: string, reason: "admin_revoked" | "logout") {
  const supabase = createAdminClient();
  await supabase
    .from("active_sessions")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: reason })
    .eq("id", sessionId)
    .is("revoked_at", null);
}

/**
 * Used by the admin "force revoke" action: bumping session_version makes
 * every cookie the user currently holds instantly fail validateSession,
 * even if we don't know which device/browser holds it.
 */
export async function revokeAllSessionsForUser(userId: string, reason: "admin_revoked" | "logout") {
  const supabase = createAdminClient();
  await supabase
    .from("active_sessions")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: reason })
    .eq("user_id", userId)
    .is("revoked_at", null);
  await supabase.rpc("bump_session_version", { p_user_id: userId });
  await supabase.channel(`user-session-${userId}`).send({
    type: "broadcast",
    event: "force_logout",
    payload: { newSessionId: null },
  });
}
