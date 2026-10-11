import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revokeSession } from "@/lib/auth/session";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await revokeSession(id, "admin_revoked");

  return NextResponse.json({ ok: true });
}
