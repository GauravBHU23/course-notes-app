import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { signupSchema } from "@/lib/utils/validators";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`signup:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many signup attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { fullName, email, mobile, password } = parsed.data;

  const supabase = createAdminClient();

  if (mobile) {
    const { data: existingMobile } = await supabase.from("profiles").select("id").eq("mobile", mobile).maybeSingle();
    if (existingMobile) {
      return NextResponse.json({ error: "This mobile number is already registered." }, { status: 409 });
    }
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, mobile },
  });

  if (error || !created?.user) {
    // Match on Supabase's stable error code rather than its message text --
    // the message is "A user with this email address has already been
    // registered", which doesn't contain the exact substring "already
    // registered" the earlier check looked for, so real duplicate-email
    // signups were silently falling through to the generic error.
    const isDuplicate = error?.code === "email_exists" || error?.status === 422;
    const message = isDuplicate
      ? "This email is already registered. Try logging in instead."
      : "Could not create account. Please try again.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  // profiles row is created by the handle_new_user trigger; mobile may need
  // a follow-up update since the trigger only reads raw_user_meta_data once.
  if (mobile) {
    await supabase.from("profiles").update({ mobile }).eq("id", created.user.id);
  }

  await sendWelcomeEmail(email, fullName);

  return NextResponse.json({ ok: true });
}
