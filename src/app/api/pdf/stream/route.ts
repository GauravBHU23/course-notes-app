import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { verifyPdfToken } from "@/lib/pdf/signToken";
import { checkPdfAccess } from "@/lib/pdf/access";
import { fetchPdfBytes } from "@/lib/pdf/storage";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_USES_PER_TOKEN = 1;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const verification = verifyPdfToken(token);
  if (!verification.valid) {
    return NextResponse.json({ error: "Invalid or expired link. Please reopen the PDF." }, { status: 403 });
  }
  const { payload } = verification;

  const cookiePayload = await getSessionPayload(req);
  const sessionCheck = await validateSession(cookiePayload);
  if (!sessionCheck.valid || !cookiePayload || cookiePayload.sessionId !== payload.sid) {
    return NextResponse.json({ error: "Session no longer valid. Please log in again." }, { status: 401 });
  }
  if (cookiePayload.userId !== payload.uid) {
    return NextResponse.json({ error: "Token does not match the current user." }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Enforce single-use atomically: only succeeds once per jti.
  const { data: tokenRow } = await supabase
    .from("pdf_access_tokens")
    .select("id, used_count, expires_at")
    .eq("token_jti", payload.jti)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Unknown token." }, { status: 403 });
  }
  if (tokenRow.used_count >= MAX_USES_PER_TOKEN) {
    return NextResponse.json({ error: "This link has already been used. Please reopen the PDF." }, { status: 403 });
  }
  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired. Please reopen the PDF." }, { status: 403 });
  }

  const { error: consumeError } = await supabase
    .from("pdf_access_tokens")
    .update({ used_count: tokenRow.used_count + 1 })
    .eq("id", tokenRow.id)
    .eq("used_count", tokenRow.used_count);

  if (consumeError) {
    return NextResponse.json({ error: "Could not validate link. Please reopen the PDF." }, { status: 403 });
  }

  // Re-check purchase validity fresh at stream time, in case access was
  // revoked by an admin or expired between token issuance and this request.
  const access = await checkPdfAccess(payload.uid, payload.pid);
  if (!access.allowed || !access.pdf) {
    return NextResponse.json({ error: "Access to this content has been revoked." }, { status: 403 });
  }

  const bytes = await fetchPdfBytes(access.pdf.storage_path);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      // Deliberately not application/pdf: this prevents the browser's
      // native PDF plugin (with its own download/print UI) from taking
      // over; the client always renders via pdf.js canvas instead.
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
