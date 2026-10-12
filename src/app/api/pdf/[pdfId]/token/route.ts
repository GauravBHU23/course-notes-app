import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { checkPdfAccess } from "@/lib/pdf/access";
import { issuePdfToken } from "@/lib/pdf/signToken";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/utils/rateLimiter";

export async function POST(req: NextRequest, { params }: { params: Promise<{ pdfId: string }> }) {
  const { pdfId } = await params;

  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!rateLimit(`pdf-token:${payload.userId}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const access = await checkPdfAccess(payload.userId, pdfId);
  if (!access.allowed || !access.pdf || !access.purchaseId) {
    return NextResponse.json(
      { error: "You don't have access to this content. Contact the administrator if you believe this is a mistake." },
      { status: 403 }
    );
  }

  const { token, jti, expiresAt } = issuePdfToken({
    userId: payload.userId,
    pdfId: access.pdf.id,
    purchaseId: access.purchaseId,
    sessionId: payload.sessionId,
  });

  const supabase = createAdminClient();
  await supabase.from("pdf_access_tokens").insert({
    user_id: payload.userId,
    pdf_id: access.pdf.id,
    purchase_id: access.purchaseId,
    token_jti: jti,
    expires_at: expiresAt.toISOString(),
  });

  return NextResponse.json({ token });
}
