import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Mints a real Supabase Auth session (cookies written via the SSR server
 * client) for a user we've already authenticated through our own means --
 * OTP verification, where we never had their password to call
 * signInWithPassword directly. Uses the documented generateLink +
 * verifyOtp(type: "magiclink") pattern: generateLink produces a one-time
 * hashed token server-side (never emailed, we already proved identity),
 * and verifying it on the cookie-aware server client both validates it and
 * writes Supabase's session cookies to the response.
 *
 * Without this, the browser never receives a Supabase Auth JWT after an
 * OTP-based login, which silently breaks anything that depends on it --
 * concretely, SessionGuard's RLS-gated realtime channel subscription,
 * which needs auth.uid() to resolve for its `private: true` channel to
 * authorize. Our own app_session/admin_session cookie (the actual access
 * control) is unaffected either way; this only restores the "instant kick"
 * realtime UX on top of it.
 */
export async function establishSupabaseSession(email: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("[establishSupabaseSession] generateLink failed:", linkError);
    return false;
  }

  const serverClient = await createServerSupabaseClient();
  const { error: verifyError } = await serverClient.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error("[establishSupabaseSession] verifyOtp failed:", verifyError);
    return false;
  }

  return true;
}
