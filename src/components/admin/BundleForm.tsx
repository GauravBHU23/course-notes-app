"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Bundle, ExamCategory } from "@/types/domain";

interface BundleFormProps {
  categories: ExamCategory[];
  bundle?: Bundle;
}

export function BundleForm({ categories, bundle }: BundleFormProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(bundle?.category_id ?? categories[0]?.id ?? "");
  const [slug, setSlug] = useState(bundle?.slug ?? "");
  const [title, setTitle] = useState(bundle?.title ?? "");
  const [description, setDescription] = useState(bundle?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(bundle?.cover_image_url ?? "");
  const [priceInr, setPriceInr] = useState(bundle ? String(bundle.price_inr) : "");
  const [validityDays, setValidityDays] = useState(bundle ? String(bundle.validity_days) : "");
  const [isActive, setIsActive] = useState(bundle?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        category_id: categoryId,
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim() || null,
        cover_image_url: coverImageUrl.trim() || null,
        price_inr: Number(priceInr),
        validity_days: Number(validityDays),
        is_active: isActive,
      };

      const res = await fetch(bundle ? `/api/admin/bundles/${bundle.id}` : "/api/admin/bundles", {
        method: bundle ? "PATCH" : "POST",
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
      toast.success(bundle ? "Bundle updated." : "Bundle created.");
      router.push("/admin/bundles");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground/80">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="ssc-cgl-2026-complete-notes"
          required
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Cover image URL"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price (INR)"
            type="number"
            min={1}
            value={priceInr}
            onChange={(e) => setPriceInr(e.target.value)}
            required
          />
          <Input
            label="Validity (days)"
            type="number"
            min={1}
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (visible to students)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" loading={loading} disabled={!categoryId}>
            {bundle ? "Save changes" : "Create bundle"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/bundles")}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
