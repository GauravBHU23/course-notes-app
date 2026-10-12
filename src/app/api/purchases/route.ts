import { NextRequest, NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/getSessionPayload";
import { validateSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * "My purchases" for clients without server-side rendering. The web
 * dashboard's my-bundles/purchases pages fetch this directly in Server
 * Components; mobile needs the equivalent as JSON.
 */
export async function GET(req: NextRequest) {
  const payload = await getSessionPayload(req);
  const sessionCheck = await validateSession(payload);
  if (!sessionCheck.valid || !payload) {
    return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: purchases, error } = await supabase
    .from("purchases")
    .select(
      "id, status, amount_inr, access_expires_at, created_at, bundle_id, bundles(title, cover_image_url, exam_categories(slug))"
    )
    .eq("user_id", payload.userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load purchases." }, { status: 500 });
  }

  const successfulBundleIds = (purchases ?? [])
    .filter((p) => p.status === "success")
    .map((p) => p.bundle_id);

  const { data: pdfs } = successfulBundleIds.length
    ? await supabase
        .from("pdfs")
        .select("id, bundle_id, title")
        .in("bundle_id", successfulBundleIds)
        .eq("is_active", true)
    : { data: [] };

  return NextResponse.json({ purchases: purchases ?? [], pdfs: pdfs ?? [] });
}
