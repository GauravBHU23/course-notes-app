import { createAdminClient } from "@/lib/supabase/admin";
import { LockedAccountsTable } from "@/components/admin/LockedAccountsTable";
import type { Profile } from "@/types/domain";

export default async function AdminLockedAccountsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .gt("locked_until", new Date().toISOString())
    .order("locked_until", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Locked accounts</h1>
      <LockedAccountsTable profiles={(data ?? []) as Profile[]} />
    </div>
  );
}
