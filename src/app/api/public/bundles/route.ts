import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";

export async function GET(req: NextRequest) {
  const categorySlug = req.nextUrl.searchParams.get("category");

  const supabase = createAnonClient();
  let query = supabase.from("bundles_public").select("*").order("created_at", { ascending: false });
  if (categorySlug) {
    query = query.eq("category_slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Could not load bundles." }, { status: 500 });
  }

  return NextResponse.json({ bundles: data ?? [] });
}
