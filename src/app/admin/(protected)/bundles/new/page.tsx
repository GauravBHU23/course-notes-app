import { createAdminClient } from "@/lib/supabase/admin";
import { BundleForm } from "@/components/admin/BundleForm";
import type { ExamCategory } from "@/types/domain";

export default async function NewBundlePage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("exam_categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New bundle</h1>
      <BundleForm categories={(data ?? []) as ExamCategory[]} />
    </div>
  );
}
