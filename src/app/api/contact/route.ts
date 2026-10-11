import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { decodeSessionCookie, APP_SESSION_COOKIE } from "@/lib/auth/cookies";
import { validateSession } from "@/lib/auth/session";
import { sendContactQueryEmail } from "@/lib/email/resend";
import { getPublicSettings } from "@/lib/settings/getPublicSettings";
import { getClientIp } from "@/lib/utils/request";
import { rateLimit } from "@/lib/utils/rateLimiter";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (ip && !rateLimit(`contact:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  // Attach the logged-in user's id if they have a valid session, purely for
  // admin-side context -- the form works for anonymous visitors too.
  const cookieStore = await cookies();
  const payload = decodeSessionCookie(cookieStore.get(APP_SESSION_COOKIE)?.value);
  const sessionCheck = await validateSession(payload);
  const userId = sessionCheck.valid && payload ? payload.userId : null;

  const supabase = createAdminClient();
  const { data: query, error: insertError } = await supabase
    .from("contact_queries")
    .insert({ name, email, subject, message, user_id: userId })
    .select("id")
    .single();

  if (insertError || !query) {
    return NextResponse.json({ error: "Could not submit your query. Please try again." }, { status: 500 });
  }

  const settings = await getPublicSettings();
  const adminEmail = settings.supportEmail;

  if (adminEmail) {
    const delivered = await sendContactQueryEmail({ adminEmail, name, email, subject, message });
    if (delivered) {
      await supabase.from("contact_queries").update({ emailed_to_admin: true }).eq("id", query.id);
    }
  }

  return NextResponse.json({ ok: true });
}
