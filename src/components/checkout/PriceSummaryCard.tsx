import { Card } from "@/components/ui/Card";

interface PriceSummaryCardProps {
  bundleTitle: string;
  amountInr: number;
  validityDays: number;
}

function humanizeValidity(days: number): string {
  if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? "s" : ""}`;
  if (days % 30 === 0) return `${days / 30} month${days / 30 > 1 ? "s" : ""}`;
  return `${days} days`;
}

export function PriceSummaryCard({ bundleTitle, amountInr, validityDays }: PriceSummaryCardProps) {
  return (
    <Card className="p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Order summary</p>
      <h3 className="mt-1 text-lg font-semibold">{bundleTitle}</h3>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-foreground/60">Access validity</span>
        <span className="font-medium">{humanizeValidity(validityDays)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold text-brand-600">₹{amountInr}</span>
      </div>
    </Card>
  );
}
