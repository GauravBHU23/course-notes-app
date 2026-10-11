"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Bundle, PdfDoc } from "@/types/domain";

// storage_path is intentionally never part of this component's props — it
// must never be sent to the client. See src/app/admin/pdfs/page.tsx.
type AdminPdfRow = Omit<PdfDoc, "storage_path">;

interface PdfsManagerProps {
  bundles: Bundle[];
  pdfsByBundle: Record<string, AdminPdfRow[]>;
}

export function PdfsManager({ bundles, pdfsByBundle }: PdfsManagerProps) {
  const router = useRouter();
  const [bundleId, setBundleId] = useState(bundles[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pdfs = useMemo(
    () => (pdfsByBundle[bundleId] ?? []).slice().sort((a, b) => a.display_order - b.display_order),
    [pdfsByBundle, bundleId]
  );

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !bundleId) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("bundle_id", bundleId);
      formData.set("title", title);
      formData.set("file", file);

      const res = await fetch("/api/admin/pdfs/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setTitle("");
      setFile(null);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(pdf: AdminPdfRow) {
    await fetch(`/api/admin/pdfs/${pdf.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !pdf.is_active }),
    });
    router.refresh();
  }

  async function move(pdf: AdminPdfRow, direction: -1 | 1) {
    const sorted = pdfs;
    const index = sorted.findIndex((p) => p.id === pdf.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;

    await fetch("/api/admin/pdfs/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: pdf.id, display_order: swapWith.display_order },
          { id: swapWith.id, display_order: pdf.display_order },
        ],
      }),
    });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">Upload PDF</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Bundle</label>
            <select
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              required
              className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {bundles.map((bundle) => (
                <option key={bundle.id} value={bundle.id}>
                  {bundle.title}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Defaults to file name"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">PDF file</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={uploading} disabled={!bundleId || !file}>
            Upload
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Pages</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pdfs.map((pdf, index) => (
              <tr key={pdf.id} className="border-t border-border-subtle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => move(pdf, -1)}
                      className="disabled:opacity-30"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      disabled={index === pdfs.length - 1}
                      onClick={() => move(pdf, 1)}
                      className="disabled:opacity-30"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{pdf.title}</td>
                <td className="px-4 py-3 text-foreground/60">{pdf.page_count ?? "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(pdf)}>
                    <Badge tone={pdf.is_active ? "success" : "neutral"}>
                      {pdf.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="danger" onClick={() => toggleActive(pdf)}>
                    {pdf.is_active ? "Soft-delete" : "Restore"}
                  </Button>
                </td>
              </tr>
            ))}
            {pdfs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No PDFs uploaded for this bundle yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
