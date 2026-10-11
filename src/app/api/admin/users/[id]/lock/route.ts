import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // manual admin lock: 24h

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ locked_until: new Date(Date.now() + LOCK_DURATION_MS).toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
