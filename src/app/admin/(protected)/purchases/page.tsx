import { createAdminClient } from "@/lib/supabase/admin";
import { PurchasesTable, type PurchaseRow } from "@/components/admin/PurchasesTable";

export default async function AdminPurchasesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("purchases")
    .select(
      "id, cashfree_order_id, amount_inr, status, created_at, profiles(full_name, email), bundles(title)"
    )
    .order("created_at", { ascending: false });

  const purchases: PurchaseRow[] = (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      cashfree_order_id: string;
      amount_inr: number;
      status: PurchaseRow["status"];
      created_at: string;
      profiles: { full_name: string; email: string } | null;
      bundles: { title: string } | null;
    };
    return {
      id: r.id,
      cashfree_order_id: r.cashfree_order_id,
      amount_inr: r.amount_inr,
      status: r.status,
      created_at: r.created_at,
      user_name: r.profiles?.full_name ?? "—",
      user_email: r.profiles?.email ?? "—",
      bundle_title: r.bundles?.title ?? "—",
    };
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Purchases</h1>
      <PurchasesTable purchases={purchases} />
    </div>
  );
}
