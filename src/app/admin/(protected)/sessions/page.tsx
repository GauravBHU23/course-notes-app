import { createAdminClient } from "@/lib/supabase/admin";
import { SessionsTable, type SessionRow } from "@/components/admin/SessionsTable";

export default async function AdminSessionsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("active_sessions")
    .select("id, device_label, ip_address, last_seen_at, created_at, profiles(full_name, email)")
    .is("revoked_at", null)
    .order("last_seen_at", { ascending: false });

  const sessions: SessionRow[] = (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      device_label: string | null;
      ip_address: string | null;
      last_seen_at: string;
      created_at: string;
      profiles: { full_name: string; email: string } | null;
    };
    return {
      id: r.id,
      device_label: r.device_label,
      ip_address: r.ip_address,
      last_seen_at: r.last_seen_at,
      created_at: r.created_at,
      user_name: r.profiles?.full_name ?? "—",
      user_email: r.profiles?.email ?? "—",
    };
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Active sessions</h1>
      <SessionsTable sessions={sessions} />
    </div>
  );
}
