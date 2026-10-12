import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/support/ContactForm";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";

export const metadata = { title: "Support | Course and Notes Purchasing App" };

export default async function SupportPage() {
  const current = await getCurrentProfile("student");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold sm:text-2xl">Support</h1>

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
          Use the chat widget in the corner of your screen, reach out via WhatsApp/Telegram, or send a
          message below and our team will get back to you by email.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-semibold">Raise a query</h2>
        <p className="mb-5 text-sm text-foreground/60">
          Describe your issue and we&apos;ll reach out to you by email as soon as possible.
        </p>
        <ContactForm
          defaultName={current?.profile.full_name ?? ""}
          defaultEmail={current?.profile.email ?? ""}
        />
      </Card>
    </div>
  );
}
