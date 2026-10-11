import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BundleCard } from "@/components/marketing/BundleCard";
import type { ExamCategory, BundlePublic } from "@/types/domain";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<ExamCategory | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("exam_categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as ExamCategory | null) ?? null;
}

async function getBundlesForCategory(slug: string): Promise<BundlePublic[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bundles_public")
    .select("*")
    .eq("category_slug", slug)
    .order("created_at", { ascending: false });

  return (data ?? []) as BundlePublic[];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found — Course and Notes Purchasing App" };
  }

  const title = `${category.name} Notes & Test Series — Course and Notes Purchasing App`;
  const description =
    category.description ??
    `Browse exam-ready PDF notes and test series bundles for ${category.name}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const bundles = await getBundlesForCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-3 text-foreground/60">{category.description}</p>
        )}
      </div>

      {bundles.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-foreground/50">
          No bundles are published for this category yet. Check back soon.
        </p>
      )}
    </div>
  );
}
