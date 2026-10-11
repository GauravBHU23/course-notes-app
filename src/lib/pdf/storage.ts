import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const PDFS_BUCKET = "pdfs-private";

export async function fetchPdfBytes(storagePath: string): Promise<ArrayBuffer> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(PDFS_BUCKET).download(storagePath);
  if (error || !data) {
    throw new Error(`Failed to fetch PDF from storage: ${error?.message}`);
  }
  return await data.arrayBuffer();
}

export async function uploadPdfBytes(storagePath: string, file: File | Blob): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(PDFS_BUCKET).upload(storagePath, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
}
