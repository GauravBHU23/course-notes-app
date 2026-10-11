import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "My Bundles | ExamPrep Store" };

export default async function MyBundlesPage() {
  const current = await getCurrentProfile("student");
  if (!current) return null;

  const supabase = createAdminClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, status, access_expires_at, bundle_id, bundles(title, cover_image_url)")
    .eq("user_id", current.profile.id)
    .eq("status", "success")
    .order("created_at", { ascending: false });

  const { data: pdfsByBundle } = await supabase
    .from("pdfs")
    .select("id, bundle_id, title")
    .eq("is_active", true);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My Bundles</h1>

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
            const bundle = purchase.bundles as unknown as { title: string; cover_image_url: string | null } | null;
            const expired = purchase.access_expires_at && new Date(purchase.access_expires_at) < new Date();
            const pdfs = (pdfsByBundle ?? []).filter((p) => p.bundle_id === purchase.bundle_id);

            return (
              <Card key={purchase.id} className="flex flex-col p-5">
                <h3 className="font-semibold">{bundle?.title ?? "Bundle"}</h3>
                <Badge tone={expired ? "danger" : "success"} className="mt-2 w-fit">
                  {expired ? "Expired" : "Active"}
                </Badge>
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
                          className="w-full justify-start"
                        >
                          📄 {pdf.title}
                        </Button>
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
