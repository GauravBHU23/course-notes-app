import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getClientIp } from "@/lib/utils/request";
import { logLoginAttempt, resetFailedAttempts } from "@/lib/auth/lockout";

/**
 * Lands here after Google redirects back with a one-time code. Exchanging
 * it writes Supabase's own auth cookies (needed for SessionGuard's realtime
 * channel, same as the rest of the app) -- but that is NOT this app's
 * access-control session. Exactly like the admin OTP step2 flow, we still
 * have to call createSession()/setSessionCookie() ourselves afterward, or a
 * Google sign-in would silently bypass the single-session-per-account
 * enforcement every password/OTP login goes through.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const redirectTarget = req.nextUrl.searchParams.get("redirect");
  const safeRedirect = redirectTarget && redirectTarget.startsWith("/") && !redirectTarget.startsWith("//")
    ? redirectTarget
    : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?reason=oauth_failed", req.url));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/login?reason=oauth_failed", req.url));
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    // handle_new_user runs on auth.users insert, so this should never
    // happen in practice; fail closed rather than issue a session with
    // nothing to attach it to.
    return NextResponse.redirect(new URL("/login?reason=oauth_failed", req.url));
  }

  if (profile.role === "admin") {
    // Google sign-in is a single-factor flow -- admin accounts require the
    // mandatory OTP second factor from the dedicated admin login, so they
    // can't use this shortcut even if the email matches an admin profile.
    return NextResponse.redirect(new URL("/admin/login?reason=oauth_not_allowed", req.url));
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent");
  await resetFailedAttempts(profile.id);
  await logLoginAttempt({ identifier: data.user.email, success: true, ipAddress: ip, userAgent });

  const { cookiePayload } = await createSession({ userId: profile.id, ipAddress: ip, userAgent });
  const cookieStore = await cookies();
  setSessionCookie(cookieStore, "student", cookiePayload);

  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
