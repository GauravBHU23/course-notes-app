import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  slug: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  icon_url: z.string().trim().max(2000).optional().nullable(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("exam_categories")
    .insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      icon_url: parsed.data.icon_url ?? null,
      display_order: parsed.data.display_order ?? 0,
      is_active: parsed.data.is_active ?? true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
