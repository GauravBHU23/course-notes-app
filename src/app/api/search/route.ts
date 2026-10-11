import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ categories: [], bundles: [] });
  }

  const supabase = createAdminClient();
  const [{ data: categories }, { data: bundles }] = await Promise.all([
    supabase
      .from("exam_categories")
      .select("slug, name, description")
      .eq("is_active", true)
      .ilike("name", `%${q}%`)
      .limit(5),
    supabase
      .from("bundles_public")
      .select("slug, title, category_slug, price_inr")
      .ilike("title", `%${q}%`)
      .limit(6),
  ]);

  return NextResponse.json({
    categories: categories ?? [],
    bundles: bundles ?? [],
  });
}
