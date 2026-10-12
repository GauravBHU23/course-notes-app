import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { updateProfileSchema } from "@/lib/utils/validators";

/**
 * "Who am I" lookup -- the web app never needed this (Server Components
 * call getCurrentProfile() directly), but the mobile app has no server-side
 * rendering and needs an explicit endpoint to hydrate its auth state on
 * launch from a stored session token.
 */
export async function GET(req: NextRequest) {
  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, mobile, role, created_at")
    .eq("id", payload.userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const ip = getClientIp(req);
  if (ip && !rateLimit(`profile-update:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { fullName, mobile } = parsed.data;
  const normalizedMobile = mobile ? mobile : null;

  const supabase = createAdminClient();

  if (normalizedMobile) {
    const { data: existingMobile } = await supabase
      .from("profiles")
      .select("id")
      .eq("mobile", normalizedMobile)
      .neq("id", payload.userId)
      .maybeSingle();
    if (existingMobile) {
      return NextResponse.json({ error: "This mobile number is already registered." }, { status: 409 });
    }
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, mobile: normalizedMobile })
    .eq("id", payload.userId)
    .select("full_name, email, mobile")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Could not update profile. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: updated });
}
