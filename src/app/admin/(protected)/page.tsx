import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";

async function getStats() {
  const supabase = createAdminClient();

  const [
    { data: revenueRows },
    { count: purchasesCount },
    { data: visitsCounter },
    { count: activeSessionsCount },
    { count: lockedCount },
    { count: openQueriesCount },
  ] = await Promise.all([
    supabase.from("purchases").select("amount_inr").eq("status", "success"),
    supabase.from("purchases").select("id", { count: "exact", head: true }).eq("status", "success"),
    supabase.from("counters").select("value").eq("key", "total_visits").maybeSingle(),
    supabase.from("active_sessions").select("id", { count: "exact", head: true }).is("revoked_at", null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("locked_until", new Date().toISOString()),
    supabase.from("contact_queries").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((sum, row) => sum + row.amount_inr, 0);

  return {
    totalRevenue,
    totalPurchases: purchasesCount ?? 0,
    totalVisitors: Number(visitsCounter?.value ?? 0),
    activeSessions: activeSessionsCount ?? 0,
    lockedAccounts: lockedCount ?? 0,
    openQueries: openQueriesCount ?? 0,
  };
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-foreground/60">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone ?? "text-foreground"}`}>{value}</p>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          tone="text-brand-700"
        />
        <StatCard label="Successful purchases" value={stats.totalPurchases.toLocaleString("en-IN")} />
        <StatCard label="Total visitors" value={stats.totalVisitors.toLocaleString("en-IN")} />
        <StatCard label="Active sessions" value={stats.activeSessions.toLocaleString("en-IN")} />
        <StatCard
          label="Locked accounts"
          value={stats.lockedAccounts.toLocaleString("en-IN")}
          tone={stats.lockedAccounts > 0 ? "text-red-600" : "text-foreground"}
        />
        <StatCard
          label="Open queries"
          value={stats.openQueries.toLocaleString("en-IN")}
          tone={stats.openQueries > 0 ? "text-amber-600" : "text-foreground"}
        />
      </div>
    </div>
  );
}
