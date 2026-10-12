import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvoicePdf } from "@/lib/invoices/generate";

export async function GET(req: NextRequest, { params }: { params: Promise<{ purchaseId: string }> }) {
  const { purchaseId } = await params;

  const studentPayload = await getSessionPayload(req, "student");
  const adminPayload = await getSessionPayload(req, "admin");

  const studentCheck = await validateSession(studentPayload);
  const adminCheck = adminPayload ? await validateSession(adminPayload) : null;

  if (!studentCheck.valid && !(adminCheck?.valid)) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, user_id, bundle_id, amount_inr, access_starts_at, access_expires_at, cashfree_order_id, status")
    .eq("id", purchaseId)
    .maybeSingle();

  if (!purchase || purchase.status !== "success") {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const isOwner = studentPayload && studentCheck.valid && purchase.user_id === studentPayload.userId;
  const isAdmin = adminCheck?.valid === true;
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("purchase_id", purchase.id)
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not generated yet." }, { status: 404 });
  }

  const [{ data: profile }, { data: bundle }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", purchase.user_id).single(),
    supabase.from("bundles").select("title").eq("id", purchase.bundle_id).single(),
  ]);

  if (!profile || !bundle) {
    return NextResponse.json({ error: "Could not render invoice." }, { status: 500 });
  }

  const pdfBuffer = await generateInvoicePdf({
    invoiceNumber: invoice.invoice_number,
    purchaseDate: new Date(purchase.access_starts_at ?? Date.now()),
    customerName: profile.full_name,
    customerEmail: profile.email,
    bundleTitle: bundle.title,
    amountInr: purchase.amount_inr,
    accessStartsAt: new Date(purchase.access_starts_at ?? Date.now()),
    accessExpiresAt: new Date(purchase.access_expires_at ?? Date.now()),
    cashfreeOrderId: purchase.cashfree_order_id,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
