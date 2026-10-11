import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  title: z.string().trim().max(300).optional().nullable(),
  image_url: z.string().trim().max(2000).optional().nullable(),
  link_url: z.string().trim().max(2000).optional().nullable(),
  display_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
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
    .from("banners")
    .insert({
      title: parsed.data.title ?? null,
      image_url: parsed.data.image_url ?? null,
      link_url: parsed.data.link_url ?? null,
      display_order: parsed.data.display_order ?? 0,
      is_active: parsed.data.is_active ?? true,
      starts_at: parsed.data.starts_at ?? null,
      ends_at: parsed.data.ends_at ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ banner: data }, { status: 201 });
}
