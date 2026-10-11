import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AnimatedHero } from "@/components/marketing/AnimatedHero";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { BundleCard } from "@/components/marketing/BundleCard";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ExamCategory, BundlePublic } from "@/types/domain";

export const metadata: Metadata = {
  title: "Course and Notes Purchasing App — SSC, Railway, Bank, UGC NET, BPSC, TRE Notes & Test Series",
  description:
    "Buy exam-ready PDF notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE exams. Affordable pricing, instant access, secure viewing.",
  openGraph: {
    title: "Course and Notes Purchasing App — Exam Notes & Test Series",
    description:
      "Curated PDF notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE aspirants.",
    type: "website",
  },
};

async function getLandingData() {
  const supabase = createAdminClient();

  const [{ data: categories }, { data: bundles }] = await Promise.all([
    supabase
      .from("exam_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("bundles_public")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    categories: (categories ?? []) as ExamCategory[],
    bundles: (bundles ?? []) as BundlePublic[],
  };
}

export default async function Home() {
  const { categories, bundles } = await getLandingData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatedHero />

        {/* Exam categories */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Choose your exam</h2>
            <p className="mt-3 text-foreground/60">
              Pick a category to see all available bundles and pricing for that exam.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-foreground/50">
              Categories will appear here once they are published.
            </p>
          )}
        </section>

        {/* Featured bundles */}
        <section className="bg-brand-50/40 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Featured bundles</h2>
              <p className="mt-3 text-foreground/60">
                Popular notes packages, picked for serious aspirants.
              </p>
            </div>

            {bundles.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} />
                ))}
              </div>
            ) : (
              <p className="mt-10 text-center text-sm text-foreground/50">
                Bundles will appear here once they are published.
              </p>
            )}

            <div className="mt-10 text-center">
              <Link href="/pricing">
                <Button variant="secondary" size="md">
                  See all bundles
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 px-8 py-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Every bundle is priced individually by the admin team — typically between ₹99 and
              ₹999 — with a clear validity period. No hidden fees, no subscriptions.
            </p>
            <div className="mt-8">
              <Link href="/pricing">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-white/90"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
