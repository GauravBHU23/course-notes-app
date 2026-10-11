import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function DashboardOverviewPage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const supabase = createAdminClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, status, amount_inr, access_expires_at, bundle_id")
    .eq("user_id", current.profile.id)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(5);

  const activeCount = (purchases ?? []).filter(
    (p) => !p.access_expires_at || new Date(p.access_expires_at) > new Date()
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {current.profile.full_name.split(" ")[0]}</h1>
        <p className="text-sm text-foreground/60">Here&apos;s a quick look at your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-foreground/60">Active bundles</p>
          <p className="mt-1 text-2xl font-bold text-brand-600">{activeCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-foreground/60">Total purchases</p>
          <p className="mt-1 text-2xl font-bold">{purchases?.length ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-foreground/60">Account status</p>
          <Badge tone="success" className="mt-1">Active</Badge>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent purchases</h2>
          <Link href="/dashboard/purchases" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {!purchases?.length ? (
          <p className="text-sm text-foreground/60">
            You haven&apos;t purchased anything yet.{" "}
            <Link href="/" className="text-brand-600 hover:underline">
              Browse bundles
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {purchases.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg border border-border-subtle p-3 text-sm">
                <span>₹{p.amount_inr}</span>
                <Badge tone={p.status === "success" ? "success" : "warning"}>{p.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
