import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAnonClient();

  const { data: bundle, error } = await supabase
    .from("bundles_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !bundle) {
    return NextResponse.json({ error: "Bundle not found." }, { status: 404 });
  }

  const { data: pdfs } = await supabase
    .from("pdfs_public")
    .select("id, title, page_count, display_order")
    .eq("bundle_id", bundle.id)
    .order("display_order", { ascending: true });

  return NextResponse.json({ bundle, pdfs: pdfs ?? [] });
}
