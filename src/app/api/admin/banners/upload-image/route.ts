import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

// Banner images go in the PUBLIC public-assets bucket (unlike PDFs), since
// they're meant to be served directly to visitors.
export async function POST(req: NextRequest) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only PNG, JPEG, WEBP, or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 400 });
  }

  const extension = file.type.split("/")[1] ?? "png";
  const path = `banners/${randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("public-assets")
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: publicUrlData } = supabase.storage.from("public-assets").getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
}
