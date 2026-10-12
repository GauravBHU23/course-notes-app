import { createAdminClient } from "@/lib/supabase/admin";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { BundleCard } from "@/components/marketing/BundleCard";
import { Card } from "@/components/ui/Card";
import type { ExamCategory, BundlePublic } from "@/types/domain";

export const metadata = { title: "Browse Courses | Course and Notes Purchasing App" };

async function getBrowseData() {
  const supabase = createAdminClient();
  const [{ data: categories }, { data: bundles }] = await Promise.all([
    supabase.from("exam_categories").select("*").eq("is_active", true).order("display_order"),
    supabase.from("bundles_public").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    categories: (categories ?? []) as ExamCategory[],
    bundles: (bundles ?? []) as BundlePublic[],
  };
}

export default async function BrowseCoursesPage() {
  const { categories, bundles } = await getBrowseData();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Browse Courses &amp; Notes</h1>
        <p className="text-sm text-foreground/60">
          Explore exam categories and bundles, and purchase instantly without leaving your dashboard.
        </p>
      </div>

      <div>
        <h2 className="mb-3 font-semibold">Exam Categories</h2>
        {categories.length === 0 ? (
          <Card className="p-6 text-center text-sm text-foreground/50">
            Categories will appear here once they are published.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-semibold">All Bundles</h2>
        {bundles.length === 0 ? (
          <Card className="p-6 text-center text-sm text-foreground/50">
            Bundles will appear here once they are published.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
