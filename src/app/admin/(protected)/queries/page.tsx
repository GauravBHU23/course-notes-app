import { createAdminClient } from "@/lib/supabase/admin";
import { QueriesTable } from "@/components/admin/QueriesTable";
import type { ContactQuery } from "@/types/domain";

export default async function AdminQueriesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_queries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Contact queries</h1>
      <QueriesTable queries={(data ?? []) as ContactQuery[]} />
    </div>
  );
}
