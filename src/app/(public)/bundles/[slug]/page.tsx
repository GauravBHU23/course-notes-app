import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPriceInr, formatValidity } from "@/lib/utils/format";
import type { BundlePublic } from "@/types/domain";

interface BundlePageProps {
  params: Promise<{ slug: string }>;
}

interface PdfSummary {
  id: string;
  title: string;
  page_count: number | null;
  display_order: number;
}

async function getBundle(slug: string): Promise<BundlePublic | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bundles_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return (data as BundlePublic | null) ?? null;
}

async function getPdfsForBundle(bundleId: string): Promise<PdfSummary[]> {
  const supabase = createAdminClient();
  // pdfs_public omits storage_path — safe to query from a public page.
  const { data } = await supabase
    .from("pdfs_public")
    .select("id, title, page_count, display_order")
    .eq("bundle_id", bundleId)
    .order("display_order", { ascending: true });

  return (data ?? []) as PdfSummary[];
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await getBundle(slug);

  if (!bundle) {
    return { title: "Bundle not found — Course and Notes Purchasing App" };
  }

  const title = `${bundle.title} (${bundle.category_name}) — Course and Notes Purchasing App`;
  const description =
    bundle.description ??
    `${bundle.title} — exam-ready notes for ${bundle.category_name} at ${formatPriceInr(
      bundle.price_inr
    )}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function BundlePage({ params }: BundlePageProps) {
  const { slug } = await params;
  const bundle = await getBundle(slug);

  if (!bundle) {
    notFound();
  }

  const pdfs = await getPdfsForBundle(bundle.id);
  const checkoutHref = `/login?redirect=${encodeURIComponent(
    `/dashboard/checkout/${bundle.slug}`
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link
        href={`/categories/${bundle.category_slug}`}
        className="text-sm font-medium text-brand-600 hover:underline"
      >
        &larr; Back to {bundle.category_name}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          <Badge tone="brand">{bundle.category_name}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{bundle.title}</h1>
          {bundle.description && (
            <p className="mt-4 text-foreground/70">{bundle.description}</p>
          )}

          <h2 className="mt-10 text-lg font-semibold text-foreground">What&apos;s included</h2>
          {pdfs.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {pdfs.map((pdf) => (
                <li
                  key={pdf.id}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm"
                >
                  <span className="font-medium text-foreground">{pdf.title}</span>
                  {pdf.page_count && (
                    <span className="text-foreground/50">{pdf.page_count} pages</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-foreground/50">
              PDF list will appear here once the admin publishes documents for this bundle.
            </p>
          )}
        </div>

        <div>
          <Card className="sticky top-24 p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {formatPriceInr(bundle.price_inr)}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground/60">
              Access for {formatValidity(bundle.validity_days)}
            </p>

            <Link href={checkoutHref} className="mt-6 block">
              <Button variant="primary" size="lg" className="w-full">
                Buy Now
              </Button>
            </Link>

            <p className="mt-3 text-center text-xs text-foreground/50">
              Login or create a free account to purchase.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
