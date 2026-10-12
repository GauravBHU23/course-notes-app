import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
        <h1 className="text-xl font-bold sm:text-2xl">
          Welcome back, {current.profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-sm text-foreground/60">Here&apos;s a quick look at your account.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-foreground/60 sm:text-sm">Active bundles</p>
          <p className="mt-1 text-xl font-bold text-brand-600 sm:text-2xl">{activeCount}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-foreground/60 sm:text-sm">Total purchases</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl">{purchases?.length ?? 0}</p>
        </Card>
        <Card className="col-span-2 p-4 sm:col-span-1 sm:p-5">
          <p className="text-xs text-foreground/60 sm:text-sm">Account status</p>
          <Badge tone="success" className="mt-1">Active</Badge>
        </Card>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 bg-gradient-to-br from-brand-50 to-accent-500/5 p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-semibold">Looking for more notes?</h2>
          <p className="text-sm text-foreground/60">
            Browse all exam categories and bundles available for purchase.
          </p>
        </div>
        <Link href="/dashboard/browse" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            Browse Courses &amp; Notes
          </Button>
        </Link>
      </Card>

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
            <Link href="/dashboard/browse" className="text-brand-600 hover:underline">
              Browse courses &amp; notes
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
