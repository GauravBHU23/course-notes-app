"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ContactQuery } from "@/types/domain";

export function QueriesTable({ queries }: { queries: ContactQuery[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");

  const filtered = queries.filter((q) => filter === "all" || q.status === filter);

  async function handleToggleStatus(id: string, newStatus: "open" | "resolved") {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/queries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Could not update query.");
        return;
      }
      toast.success(newStatus === "resolved" ? "Marked as resolved." : "Reopened query.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["open", "resolved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              filter === f ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <Fragment key={q.id}>
                <tr className="border-t border-border-subtle">
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.name}</div>
                    <div className="text-xs text-foreground/50">{q.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                      className="text-left font-medium text-brand-600 hover:underline"
                    >
                      {q.subject}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">
                    {new Date(q.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={q.status === "open" ? "warning" : "success"}>{q.status}</Badge>
                    {!q.emailed_to_admin && (
                      <Badge tone="danger" className="ml-1">
                        Email failed
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={q.status === "open" ? "primary" : "secondary"}
                      loading={loading === q.id}
                      onClick={() => handleToggleStatus(q.id, q.status === "open" ? "resolved" : "open")}
                    >
                      {q.status === "open" ? "Mark resolved" : "Reopen"}
                    </Button>
                  </td>
                </tr>
                {expanded === q.id && (
                  <tr className="border-t border-border-subtle bg-brand-50/30">
                    <td colSpan={5} className="px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm text-foreground/80">{q.message}</p>
                      <a
                        href={`mailto:${q.email}?subject=Re: ${encodeURIComponent(q.subject)}`}
                        className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                      >
                        Reply via email →
                      </a>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No {filter !== "all" ? filter : ""} queries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
