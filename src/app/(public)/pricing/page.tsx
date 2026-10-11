import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AnimatedBundleGrid } from "@/components/marketing/AnimatedBundleGrid";
import type { BundlePublic } from "@/types/domain";

export const metadata: Metadata = {
  title: "Pricing — Course and Notes Purchasing App",
  description:
    "Browse every exam-prep bundle across SSC, Railway, Bank, UGC NET, BPSC and TRE with transparent pricing and validity periods.",
  openGraph: {
    title: "Pricing — Course and Notes Purchasing App",
    description: "Transparent pricing for every exam-prep bundle, grouped by category.",
    type: "website",
  },
};

async function getAllBundles(): Promise<BundlePublic[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bundles_public")
    .select("*")
    .order("category_name", { ascending: true })
    .order("price_inr", { ascending: true });

  return (data ?? []) as BundlePublic[];
}

function groupByCategory(bundles: BundlePublic[]) {
  const groups = new Map<string, BundlePublic[]>();
  for (const bundle of bundles) {
    const key = bundle.category_name;
    const existing = groups.get(key) ?? [];
    existing.push(bundle);
    groups.set(key, existing);
  }
  return Array.from(groups.entries());
}

export default async function PricingPage() {
  const bundles = await getAllBundles();
  const grouped = groupByCategory(bundles);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Pricing</h1>
        <p className="mt-3 text-foreground/60">
          Every bundle is priced individually with a clear validity window — no subscriptions,
          no hidden fees. Pick an exam category below to see what&apos;s on offer.
        </p>
      </div>

      {grouped.length > 0 ? (
        <div className="mt-14 space-y-16">
          {grouped.map(([categoryName, categoryBundles]) => (
            <section key={categoryName}>
              <h2 className="mb-6 text-2xl font-semibold text-foreground">{categoryName}</h2>
              <AnimatedBundleGrid bundles={categoryBundles} />
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-sm text-foreground/50">
          Pricing will appear here once bundles are published.
        </p>
      )}
    </div>
  );
}
