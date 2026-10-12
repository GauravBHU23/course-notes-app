import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/icons/CategoryIcons";
import { ReceiptIcon } from "@/components/icons/NavIcons";

const gradients = [
  "from-brand-500 to-accent-500",
  "from-indigo-500 to-brand-500",
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-brand-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

function gradientFor(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return gradients[hash % gradients.length];
}

export const metadata = { title: "My Bundles | Course and Notes Purchasing App" };

export default async function MyBundlesPage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const supabase = createAdminClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      "id, status, access_expires_at, bundle_id, bundles(title, cover_image_url, exam_categories(slug))"
    )
    .eq("user_id", current.profile.id)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  const { data: pdfsByBundle } = await supabase
    .from("pdfs")
    .select("id, bundle_id, title")
    .eq("is_active", true);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold sm:text-2xl">My Bundles</h1>

      {!purchases?.length ? (
        <Card className="p-8 text-center text-sm text-foreground/60">
          You don&apos;t have any active bundles yet.{" "}
          <Link href="/" className="text-brand-600 hover:underline">
            Browse available bundles
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => {
            const bundle = purchase.bundles as unknown as {
              title: string;
              cover_image_url: string | null;
              exam_categories: { slug: string } | null;
            } | null;
            const categorySlug = bundle?.exam_categories?.slug ?? "ssc";
            const gradient = gradientFor(categorySlug);
            const expired = purchase.access_expires_at && new Date(purchase.access_expires_at) < new Date();
            const pdfs = (pdfsByBundle ?? []).filter((p) => p.bundle_id === purchase.bundle_id);

            return (
              <Card key={purchase.id} className="flex flex-col overflow-hidden p-0">
                <div
                  className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
                  {bundle?.cover_image_url ? (
                    <Image
                      src={bundle.cover_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
                      <CategoryIcon slug={categorySlug} className="h-6 w-6" />
                    </span>
                  )}
                  <Badge
                    tone={expired ? "danger" : "success"}
                    className="absolute right-3 top-3 bg-white/90 text-foreground backdrop-blur-sm"
                  >
                    {expired ? "Expired" : "Active"}
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold">{bundle?.title ?? "Bundle"}</h3>
                  {purchase.access_expires_at && (
                    <p className="mt-2 text-xs text-foreground/50">
                      Valid until {new Date(purchase.access_expires_at).toLocaleDateString("en-IN")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    {pdfs.length === 0 ? (
                      <p className="text-xs text-foreground/50">No PDFs added yet.</p>
                    ) : (
                      pdfs.map((pdf) => (
                        <Link key={pdf.id} href={expired ? "#" : `/dashboard/viewer/${pdf.id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={!!expired}
                            className="w-full justify-start gap-2"
                          >
                            <ReceiptIcon className="h-4 w-4 shrink-0" /> {pdf.title}
                          </Button>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
