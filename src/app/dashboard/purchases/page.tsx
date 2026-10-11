import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Purchases | Course and Notes Purchasing App" };

const statusTone = {
  success: "success",
  pending: "warning",
  failed: "danger",
  cancelled: "neutral",
} as const;

export default async function PurchasesPage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const supabase = createAdminClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, status, amount_inr, created_at, access_expires_at, bundles(title)")
    .eq("user_id", current.profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Purchase history</h1>

      {!purchases?.length ? (
        <Card className="p-8 text-center text-sm text-foreground/60">No purchases yet.</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-left text-foreground/60">
              <tr>
                <th className="px-5 py-3 font-medium">Bundle</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const bundle = p.bundles as unknown as { title: string } | null;
                return (
                  <tr key={p.id} className="border-t border-border-subtle">
                    <td className="px-5 py-3">{bundle?.title ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground/60">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3">₹{p.amount_inr}</td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone[p.status as keyof typeof statusTone] ?? "neutral"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {p.status === "success" ? (
                        <a href={`/api/invoices/${p.id}`} className="text-brand-600 hover:underline">
                          Download
                        </a>
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
