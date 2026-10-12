import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";

/**
 * Public catalog read for clients without server-side rendering (the
 * mobile app). The web app fetches this directly in Server Components;
 * mobile has no equivalent, so it needs an explicit endpoint. Uses the
 * anon client, not the admin client -- RLS's exam_categories_read_active
 * policy already scopes this to is_active rows, so there's no need for a
 * service-role bypass here.
 */
export async function GET() {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("exam_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load categories." }, { status: 500 });
  }

  return NextResponse.json({ categories: data ?? [] });
}
