import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int() })).min(1),
});

export async function POST(req: NextRequest) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  await Promise.all(
    parsed.data.items.map((item) =>
      supabase.from("pdfs").update({ display_order: item.display_order }).eq("id", item.id)
    )
  );

  return NextResponse.json({ ok: true });
}
