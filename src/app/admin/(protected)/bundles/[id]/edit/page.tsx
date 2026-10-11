import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BundleForm } from "@/components/admin/BundleForm";
import type { Bundle, ExamCategory } from "@/types/domain";

export default async function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: bundle }, { data: categories }] = await Promise.all([
    supabase.from("bundles").select("*").eq("id", id).maybeSingle(),
    supabase.from("exam_categories").select("*").order("display_order", { ascending: true }),
  ]);

  if (!bundle) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit bundle</h1>
      <BundleForm categories={(categories ?? []) as ExamCategory[]} bundle={bundle as Bundle} />
    </div>
  );
}
