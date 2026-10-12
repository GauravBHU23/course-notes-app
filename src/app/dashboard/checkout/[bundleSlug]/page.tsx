import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CashfreeCheckout } from "@/components/checkout/CashfreeCheckout";

export default async function CheckoutPage({ params }: { params: Promise<{ bundleSlug: string }> }) {
  const { bundleSlug } = await params;

  const supabase = createAdminClient();
  const { data: bundle } = await supabase
    .from("bundles")
    .select("title, price_inr, validity_days, is_active")
    .eq("slug", bundleSlug)
    .maybeSingle();

  if (!bundle || !bundle.is_active) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold sm:text-2xl">Complete your purchase</h1>
      <CashfreeCheckout
        bundleSlug={bundleSlug}
        bundleTitle={bundle.title}
        amountInr={bundle.price_inr}
        validityDays={bundle.validity_days}
      />
    </div>
  );
}
