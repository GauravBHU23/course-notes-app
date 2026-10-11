import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const supabase = createAdminClient();

  const [{ data: categories }, { data: bundles }] = await Promise.all([
    supabase.from("exam_categories").select("slug").eq("is_active", true),
    supabase.from("bundles_public").select("slug"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/pricing`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const bundleRoutes: MetadataRoute.Sitemap = (bundles ?? []).map((bundle) => ({
    url: `${siteUrl}/bundles/${bundle.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...bundleRoutes];
}
