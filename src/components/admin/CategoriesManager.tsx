"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ExamCategory } from "@/types/domain";

interface FormState {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  icon_url: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  id: null,
  slug: "",
  name: "",
  description: "",
  icon_url: "",
  display_order: "0",
  is_active: true,
};

export function CategoriesManager({ categories }: { categories: ExamCategory[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(category: ExamCategory) {
    setForm({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? "",
      icon_url: category.icon_url ?? "",
      display_order: String(category.display_order),
      is_active: category.is_active,
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        icon_url: form.icon_url.trim() || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      };

      const res = await fetch(form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This fails if bundles still reference it.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error ?? "Could not delete category.");
      return;
    }
    router.refresh();
  }

  async function toggleActive(category: ExamCategory) {
    await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !category.is_active }),
    });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-1">
        <h2 className="mb-4 text-lg font-semibold">{form.id ? "Edit category" : "New category"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="ssc-cgl"
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Icon URL"
            value={form.icon_url}
            onChange={(e) => setForm({ ...form, icon_url: e.target.value })}
          />
          <Input
            label="Display order"
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: e.target.value })}
          />
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
              {form.id ? "Save changes" : "Create category"}
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-foreground/60">{category.slug}</td>
                <td className="px-4 py-3">{category.display_order}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(category)}>
                    <Badge tone={category.is_active ? "success" : "neutral"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(category)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
