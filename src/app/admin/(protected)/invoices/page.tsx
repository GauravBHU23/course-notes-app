import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AdminInvoicesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, emailed_at, created_at, purchase_id, purchases(amount_inr, profiles(full_name, email))"
    )
    .order("created_at", { ascending: false });

  const invoices = (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      invoice_number: string;
      emailed_at: string | null;
      created_at: string;
      purchase_id: string;
      purchases: { amount_inr: number; profiles: { full_name: string; email: string } | null } | null;
    };
    return {
      id: r.id,
      invoiceNumber: r.invoice_number,
      emailedAt: r.emailed_at,
      createdAt: r.created_at,
      purchaseId: r.purchase_id,
      amount: r.purchases?.amount_inr ?? null,
      userName: r.purchases?.profiles?.full_name ?? "—",
      userEmail: r.purchases?.profiles?.email ?? "—",
    };
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Invoices</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice #</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Emailed</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Purchase</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-mono text-xs">{invoice.invoiceNumber}</td>
                <td className="px-4 py-3">
                  <div>{invoice.userName}</div>
                  <div className="text-xs text-foreground/50">{invoice.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  {invoice.amount !== null ? `₹${invoice.amount.toLocaleString("en-IN")}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={invoice.emailedAt ? "success" : "warning"}>
                    {invoice.emailedAt ? new Date(invoice.emailedAt).toLocaleDateString() : "Not sent"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-foreground/50">
                  {invoice.purchaseId.slice(0, 8)}…
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  No invoices generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
