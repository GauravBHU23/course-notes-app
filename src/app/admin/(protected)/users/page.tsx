import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Profile } from "@/types/domain";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>
      <UsersTable users={(data ?? []) as Profile[]} />
    </div>
  );
}
