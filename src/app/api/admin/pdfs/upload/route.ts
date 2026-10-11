import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

export async function POST(req: NextRequest) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const bundleId = formData.get("bundle_id");
  const title = formData.get("title");
  const file = formData.get("file");

  if (typeof bundleId !== "string" || !bundleId) {
    return NextResponse.json({ error: "bundle_id is required." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }
  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: bundle } = await supabase.from("bundles").select("id").eq("id", bundleId).maybeSingle();
  if (!bundle) {
    return NextResponse.json({ error: "Bundle not found." }, { status: 404 });
  }

  // Randomized storage path — never the original filename — inside the
  // private pdfs-private bucket. storage_path must never reach the client.
  const storagePath = `${bundleId}/${randomUUID()}.pdf`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("pdfs-private")
    .upload(storagePath, arrayBuffer, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: maxOrderRow } = await supabase
    .from("pdfs")
    .select("display_order")
    .eq("bundle_id", bundleId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxOrderRow?.display_order ?? -1) + 1;

  const { data: pdfRow, error: insertError } = await supabase
    .from("pdfs")
    .insert({
      bundle_id: bundleId,
      title: typeof title === "string" && title.trim() ? title.trim() : file.name.replace(/\.pdf$/i, ""),
      storage_path: storagePath,
      file_size_bytes: file.size,
      display_order: nextOrder,
    })
    .select("id, bundle_id, title, page_count, file_size_bytes, display_order, is_active, created_at")
    .single();

  if (insertError) {
    await supabase.storage.from("pdfs-private").remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ pdf: pdfRow }, { status: 201 });
}
