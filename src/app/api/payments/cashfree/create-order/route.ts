import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCashfreeOrder } from "@/lib/cashfree/client";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { z } from "zod";

const bodySchema = z.object({
  bundleSlug: z.string().trim().min(1),
  platform: z.enum(["web", "mobile"]).optional().default("web"),
});

export async function POST(req: NextRequest) {
  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  if (!rateLimit(`create-order:${payload.userId}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, mobile")
    .eq("id", payload.userId)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Canonical price/validity are read from the DB, never trusted from the client.
  const { data: bundle } = await supabase
    .from("bundles")
    .select("id, title, price_inr, validity_days, is_active")
    .eq("slug", parsed.data.bundleSlug)
    .maybeSingle();

  if (!bundle || !bundle.is_active) {
    return NextResponse.json({ error: "This bundle is not available." }, { status: 404 });
  }

  // Prevent duplicate active purchases: if the user already has unexpired
  // access to this bundle, don't let them pay again.
  const nowIso = new Date().toISOString();
  const { data: existing } = await supabase
    .from("purchases")
    .select("id, access_expires_at")
    .eq("user_id", profile.id)
    .eq("bundle_id", bundle.id)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && (!existing.access_expires_at || existing.access_expires_at > nowIso)) {
    return NextResponse.json({ error: "You already have active access to this bundle." }, { status: 409 });
  }

  const orderId = `order_${randomUUID()}`;

  const { error: insertError } = await supabase.from("purchases").insert({
    user_id: profile.id,
    bundle_id: bundle.id,
    cashfree_order_id: orderId,
    amount_inr: bundle.price_inr,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const { paymentSessionId } = await createCashfreeOrder({
      orderId,
      amountInr: bundle.price_inr,
      customerId: profile.id,
      customerName: profile.full_name,
      customerEmail: profile.email,
      customerPhone: profile.mobile ?? "",
      returnUrl: `${siteUrl}/dashboard/checkout/${parsed.data.bundleSlug}/success`,
    });

    return NextResponse.json({
      paymentSessionId,
      orderId,
      amountInr: bundle.price_inr,
      bundleTitle: bundle.title,
    });
  } catch {
    await supabase.from("purchases").update({ status: "failed" }).eq("cashfree_order_id", orderId);
    return NextResponse.json({ error: "Could not initiate payment. Please try again." }, { status: 502 });
  }
}
