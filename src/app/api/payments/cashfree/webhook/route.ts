import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree/webhook";
import { nextInvoiceNumber } from "@/lib/invoices/numbering";
import { generateInvoicePdf } from "@/lib/invoices/generate";
import { sendInvoiceEmail } from "@/lib/email/resend";

/**
 * Authoritative payment confirmation. The client-side checkout redirect is
 * NEVER trusted for granting access — only a signature-verified webhook
 * call from Cashfree flips a purchase to "success".
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature headers." }, { status: 400 });
  }

  const validSignature = verifyCashfreeWebhookSignature({ rawBody, timestamp, signature });
  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; data?: { order?: { order_id?: string }; payment?: { cf_payment_id?: string | number } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const eventType = event.type as string | undefined;
  const orderId = event.data?.order?.order_id as string | undefined;
  const cfPaymentId = event.data?.payment?.cf_payment_id as string | number | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, user_id, bundle_id, amount_inr, status, created_at")
    .eq("cashfree_order_id", orderId)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  // Idempotent: Cashfree retries webhooks, and a purchase can only be
  // transitioned out of "pending" once.
  if (purchase.status !== "pending") {
    return NextResponse.json({ ok: true, note: "Already processed." });
  }

  const isSuccess = eventType === "PAYMENT_SUCCESS_WEBHOOK";
  const isFailure = eventType === "PAYMENT_FAILED_WEBHOOK" || eventType === "PAYMENT_USER_DROPPED_WEBHOOK";

  if (isFailure) {
    await supabase
      .from("purchases")
      .update({ status: "failed", cashfree_payment_id: cfPaymentId ? String(cfPaymentId) : null })
      .eq("id", purchase.id);
    return NextResponse.json({ ok: true });
  }

  if (!isSuccess) {
    // Unrecognized/irrelevant event type; acknowledge without changing state.
    return NextResponse.json({ ok: true, note: "Ignored event type." });
  }

  const { data: bundle } = await supabase
    .from("bundles")
    .select("title, validity_days")
    .eq("id", purchase.bundle_id)
    .single();

  if (!bundle) {
    return NextResponse.json({ error: "Bundle no longer exists." }, { status: 500 });
  }

  const accessStartsAt = new Date();
  const accessExpiresAt = new Date(accessStartsAt.getTime() + bundle.validity_days * 24 * 60 * 60 * 1000);

  await supabase
    .from("purchases")
    .update({
      status: "success",
      cashfree_payment_id: cfPaymentId ? String(cfPaymentId) : null,
      access_starts_at: accessStartsAt.toISOString(),
      access_expires_at: accessExpiresAt.toISOString(),
    })
    .eq("id", purchase.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", purchase.user_id)
    .single();

  if (profile) {
    try {
      const invoiceNumber = await nextInvoiceNumber();
      const pdfBuffer = await generateInvoicePdf({
        invoiceNumber,
        purchaseDate: accessStartsAt,
        customerName: profile.full_name,
        customerEmail: profile.email,
        bundleTitle: bundle.title,
        amountInr: purchase.amount_inr,
        accessStartsAt,
        accessExpiresAt,
        cashfreeOrderId: orderId,
      });

      await supabase.from("invoices").insert({
        purchase_id: purchase.id,
        invoice_number: invoiceNumber,
        emailed_at: new Date().toISOString(),
      });

      await sendInvoiceEmail({
        to: profile.email,
        fullName: profile.full_name,
        bundleTitle: bundle.title,
        amountInr: purchase.amount_inr,
        invoiceNumber,
        accessExpiresAt: accessExpiresAt.toISOString(),
        invoicePdfBuffer: pdfBuffer,
      });
    } catch (err) {
      // Payment/access grant already succeeded above; invoice/email
      // failures should not fail the webhook response to Cashfree (which
      // would trigger pointless retries of an already-settled payment).
      console.error("Invoice generation/email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
