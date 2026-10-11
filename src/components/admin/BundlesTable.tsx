"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Bundle } from "@/types/domain";

interface BundleRow extends Bundle {
  category_name: string;
}

export function BundlesTable({ bundles }: { bundles: BundleRow[] }) {
  const router = useRouter();

  async function toggleActive(bundle: BundleRow) {
    const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !bundle.is_active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not update bundle.");
      return;
    }
    toast.success(bundle.is_active ? "Bundle deactivated." : "Bundle activated.");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bundle? This fails if purchases or PDFs still reference it.")) return;
    const res = await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data.error ?? "Could not delete bundle.";
      alert(message);
      toast.error(message);
      return;
    }
    toast.success("Bundle deleted.");
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-brand-50/60 text-left text-foreground/60">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Validity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle) => (
            <tr key={bundle.id} className="border-t border-border-subtle">
              <td className="px-4 py-3 font-medium">{bundle.title}</td>
              <td className="px-4 py-3 text-foreground/60">{bundle.category_name}</td>
              <td className="px-4 py-3">₹{bundle.price_inr.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3">{bundle.validity_days} days</td>
              <td className="px-4 py-3">
                <button onClick={() => toggleActive(bundle)}>
                  <Badge tone={bundle.is_active ? "success" : "neutral"}>
                    {bundle.is_active ? "Active" : "Inactive"}
                  </Badge>
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/bundles/${bundle.id}/edit`}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(bundle.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {bundles.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                No bundles yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
