import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The success page polls this to find out whether the webhook has
 * confirmed the payment yet. We only ever read our own purchases.status
 * here -- never the client-side Cashfree redirect query params, which
 * could be replayed or forged.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("status, user_id, amount_inr, access_expires_at")
    .eq("cashfree_order_id", orderId)
    .maybeSingle();

  if (!purchase || purchase.user_id !== payload.userId) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    status: purchase.status,
    amountInr: purchase.amount_inr,
    accessExpiresAt: purchase.access_expires_at,
  });
}
