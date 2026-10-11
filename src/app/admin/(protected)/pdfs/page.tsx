import { createAdminClient } from "@/lib/supabase/admin";
import { PdfsManager } from "@/components/admin/PdfsManager";
import type { Bundle, PdfDoc } from "@/types/domain";

// storage_path must never reach the client — select every pdfs column the
// admin UI needs EXCEPT storage_path, and never spread/forward a full pdfs
// row into the client component below.
type AdminPdfRow = Omit<PdfDoc, "storage_path">;

export default async function AdminPdfsPage() {
  const supabase = createAdminClient();

  const [{ data: bundles }, { data: pdfs }] = await Promise.all([
    supabase.from("bundles").select("*").order("title", { ascending: true }),
    supabase
      .from("pdfs")
      .select("id, bundle_id, title, page_count, file_size_bytes, display_order, is_active, created_at")
      .order("display_order", { ascending: true }),
  ]);

  const pdfsByBundle: Record<string, AdminPdfRow[]> = {};
  for (const pdf of pdfs ?? []) {
    const bundleId = (pdf as AdminPdfRow).bundle_id;
    pdfsByBundle[bundleId] = pdfsByBundle[bundleId] ?? [];
    pdfsByBundle[bundleId].push(pdf as AdminPdfRow);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">PDFs</h1>
      <PdfsManager bundles={(bundles ?? []) as Bundle[]} pdfsByBundle={pdfsByBundle} />
    </div>
  );
}
