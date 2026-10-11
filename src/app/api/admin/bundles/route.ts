import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  category_id: z.string().uuid(),
  slug: z.string().trim().min(1).max(150),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional().nullable(),
  cover_image_url: z.string().trim().max(2000).optional().nullable(),
  price_inr: z.number().int().positive(),
  validity_days: z.number().int().positive(),
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
    .from("bundles")
    .insert({
      category_id: parsed.data.category_id,
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      cover_image_url: parsed.data.cover_image_url ?? null,
      price_inr: parsed.data.price_inr,
      validity_days: parsed.data.validity_days,
      is_active: parsed.data.is_active ?? true,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ bundle: data }, { status: 201 });
}
