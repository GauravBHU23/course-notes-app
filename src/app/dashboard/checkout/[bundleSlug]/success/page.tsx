import { Card } from "@/components/ui/Card";
import { CheckoutResultPoller } from "@/components/checkout/CheckoutResultPoller";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  return (
    <Card className="mx-auto max-w-md p-8">
      <CheckoutResultPoller orderId={order_id ?? null} />
    </Card>
  );
}
