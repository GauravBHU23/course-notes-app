import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodeSessionCookie, APP_SESSION_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/auth/cookies";
import type { Profile } from "@/types/domain";

/**
 * Reads the app-level session cookie (already validated by middleware for
 * any route under /dashboard or /admin) and loads the full profile row.
 * Use in Server Components/layouts that need profile fields beyond what
 * the cookie carries (name, email, mobile, etc).
 */
export async function getCurrentProfile(role: "student" | "admin"): Promise<{
  profile: Profile;
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(role === "admin" ? ADMIN_SESSION_COOKIE : APP_SESSION_COOKIE)?.value;
  const payload = decodeSessionCookie(raw);
  if (!payload) return null;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", payload.userId)
    .single();

  if (!profile) return null;
  return { profile: profile as Profile, sessionId: payload.sessionId };
}
