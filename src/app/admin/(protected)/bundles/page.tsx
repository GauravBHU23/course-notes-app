import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { BundlesTable } from "@/components/admin/BundlesTable";
import { Button } from "@/components/ui/Button";
import type { Bundle } from "@/types/domain";

export default async function AdminBundlesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bundles")
    .select("*, exam_categories(name)")
    .order("created_at", { ascending: false });

  const bundles = (data ?? []).map((row) => {
    const { exam_categories, ...bundle } = row as unknown as Bundle & {
      exam_categories: { name: string } | null;
    };
    return { ...bundle, category_name: exam_categories?.name ?? "—" };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bundles</h1>
        <Link href="/admin/bundles/new">
          <Button>+ New bundle</Button>
        </Link>
      </div>
      <BundlesTable bundles={bundles} />
    </div>
  );
}
