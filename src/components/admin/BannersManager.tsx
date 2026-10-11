"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Banner } from "@/types/domain";

interface FormState {
  id: string | null;
  title: string;
  image_url: string;
  link_url: string;
  display_order: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const emptyForm: FormState = {
  id: null,
  title: "",
  image_url: "",
  link_url: "",
  display_order: "0",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function BannersManager({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(banner: Banner) {
    setForm({
      id: banner.id,
      title: banner.title ?? "",
      image_url: banner.image_url ?? "",
      link_url: banner.link_url ?? "",
      display_order: String(banner.display_order),
      is_active: banner.is_active,
      starts_at: toDateInputValue(banner.starts_at),
      ends_at: toDateInputValue(banner.ends_at),
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setError(null);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/admin/banners/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Image upload failed.";
        setError(message);
        toast.error(message);
        return;
      }
      setForm((f) => ({ ...f, image_url: data.url }));
      toast.success("Image uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim() || null,
        image_url: form.image_url.trim() || null,
        link_url: form.link_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };

      const res = await fetch(form.id ? `/api/admin/banners/${form.id}` : "/api/admin/banners", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Something went wrong.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success(form.id ? "Banner updated." : "Banner created.");
      resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete banner.");
      return;
    }
    toast.success("Banner deleted.");
    router.refresh();
  }

  async function toggleActive(banner: Banner) {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not update banner.");
      return;
    }
    toast.success(banner.is_active ? "Banner deactivated." : "Banner activated.");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">{form.id ? "Edit banner" : "New banner"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Banner image</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-brand-700"
            />
            {uploading && <p className="text-xs text-foreground/50">Uploading…</p>}
            {form.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={form.image_url} alt="Banner preview" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>

          <Input
            label="Link URL"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
          />
          <Input
            label="Display order"
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starts at"
              type="date"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
            <Input
              label="Ends at"
              type="date"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              {form.id ? "Save changes" : "Create banner"}
            </Button>
            {form.id && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Window</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-t border-border-subtle">
                <td className="px-4 py-3">
                  {banner.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={banner.image_url} alt={banner.title ?? ""} className="h-10 w-16 rounded object-cover" />
                  ) : (
                    <span className="text-foreground/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{banner.title ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/60">
                  {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString() : "—"} –{" "}
                  {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(banner)}>
                    <Badge tone={banner.is_active ? "success" : "neutral"}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(banner)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(banner.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No banners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
