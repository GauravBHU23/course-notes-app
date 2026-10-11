import { Card } from "@/components/ui/Card";

export const metadata = { title: "Support | Course and Notes Purchasing App" };

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Support</h1>

      <Card className="p-6">
        <h2 className="mb-2 font-semibold">Common issues</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-foreground/70">
          <li>PDFs are intentionally view-only and cannot be downloaded — this is by design, not a bug.</li>
          <li>If your account is locked, wait 5 minutes after 3 failed login attempts, then try again.</li>
          <li>If you were unexpectedly logged out, it means your account was opened on another device.</li>
          <li>If a payment was deducted but access wasn&apos;t granted, contact the administrator with your order ID.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="mb-2 font-semibold">Still need help?</h2>
        <p className="text-sm text-foreground/60">
          Use the chat widget in the corner of your screen, or reach out via WhatsApp/Telegram for a faster
          response from our team.
        </p>
      </Card>
    </div>
  );
}
