import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pdfs")
    .update(parsed.data)
    .eq("id", id)
    .select("id, bundle_id, title, page_count, file_size_bytes, display_order, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ pdf: data });
}

// Soft-delete only: PDFs are never hard-deleted so purchase history/audit
// trails stay intact. storage_path is left in place; use is_active=false to
// hide it from the viewer.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("pdfs").update({ is_active: false }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
