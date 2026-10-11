import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PdfAccessCheck {
  allowed: boolean;
  pdf?: { id: string; bundle_id: string; storage_path: string };
  purchaseId?: string;
}

/**
 * Confirms the user has an active, unexpired, successful purchase covering
 * this PDF's bundle. Called both at token-issuance time and again at
 * stream time, since a purchase can be revoked or expire in between.
 */
export async function checkPdfAccess(userId: string, pdfId: string): Promise<PdfAccessCheck> {
  const supabase = createAdminClient();

  const { data: pdf } = await supabase
    .from("pdfs")
    .select("id, bundle_id, storage_path, is_active")
    .eq("id", pdfId)
    .maybeSingle();

  if (!pdf || !pdf.is_active) return { allowed: false };

  const nowIso = new Date().toISOString();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, access_expires_at")
    .eq("user_id", userId)
    .eq("bundle_id", pdf.bundle_id)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!purchase) return { allowed: false };
  if (purchase.access_expires_at && purchase.access_expires_at < nowIso) {
    return { allowed: false };
  }

  return {
    allowed: true,
    pdf: { id: pdf.id, bundle_id: pdf.bundle_id, storage_path: pdf.storage_path },
    purchaseId: purchase.id,
  };
}
