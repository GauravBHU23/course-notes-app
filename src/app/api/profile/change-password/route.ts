import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnonClient } from "@/lib/supabase/anon";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { changePasswordSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (ip && !rateLimit(`change-password:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", payload.userId)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Verify the current password via a throwaway anon client -- never the
  // cookie-aware server client, which would overwrite this request's actual
  // app session with whatever this sign-in call produces.
  const anon = createAnonClient();
  const { error: verifyError } = await anon.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(payload.userId, {
    password: newPassword,
  });
  if (updateError) {
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }

  // Unlike a forgot-password reset, the user just proved they hold the
  // current password from this very session -- only the OTHER devices need
  // to be signed out, not this one.
  await supabase
    .from("active_sessions")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: "password_changed" })
    .eq("user_id", payload.userId)
    .neq("id", payload.sessionId)
    .is("revoked_at", null);

  return NextResponse.json({ ok: true });
}
