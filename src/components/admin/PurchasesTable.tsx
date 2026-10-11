"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PurchaseStatus } from "@/types/domain";

export interface PurchaseRow {
  id: string;
  cashfree_order_id: string;
  amount_inr: number;
  status: PurchaseStatus;
  created_at: string;
  user_name: string;
  user_email: string;
  bundle_title: string;
}

const statusTone: Record<PurchaseStatus, "success" | "warning" | "danger" | "neutral"> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  cancelled: "neutral",
};

export function PurchasesTable({ purchases }: { purchases: PurchaseRow[] }) {
  const [status, setStatus] = useState<"all" | PurchaseStatus>("all");

  const filtered = useMemo(
    () => (status === "all" ? purchases : purchases.filter((p) => p.status === status)),
    [purchases, status]
  );

  const totalRevenue = useMemo(
    () => filtered.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount_inr, 0),
    [filtered]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["all", "pending", "success", "failed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                status === s ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-sm font-medium text-foreground/70">
          Revenue (shown rows): <span className="text-brand-700">₹{totalRevenue.toLocaleString("en-IN")}</span>
        </p>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Bundle</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((purchase) => (
              <tr key={purchase.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-mono text-xs">{purchase.cashfree_order_id}</td>
                <td className="px-4 py-3">
                  <div>{purchase.user_name}</div>
                  <div className="text-xs text-foreground/50">{purchase.user_email}</div>
                </td>
                <td className="px-4 py-3">{purchase.bundle_title}</td>
                <td className="px-4 py-3">₹{purchase.amount_inr.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone[purchase.status]}>{purchase.status}</Badge>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(purchase.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  No purchases match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
