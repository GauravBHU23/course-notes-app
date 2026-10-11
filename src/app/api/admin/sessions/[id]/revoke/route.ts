import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revokeSession, revokeAllSessionsForUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Since this platform only ever allows one active session per user,
  // revoking "a" session always means revoking the live one -- so this also
  // bumps session_version and fires the realtime broadcast for an instant
  // kick, rather than waiting for that user's next request to notice.
  const supabase = createAdminClient();
  const { data: session } = await supabase
    .from("active_sessions")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (session) {
    await revokeAllSessionsForUser(session.user_id, "admin_revoked");
  } else {
    await revokeSession(id, "admin_revoked");
  }

  return NextResponse.json({ ok: true });
}
