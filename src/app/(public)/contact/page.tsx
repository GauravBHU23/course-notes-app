import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// TODO: read these from the `settings` table (whatsapp_link, telegram_link,
// support_email, support_phone) once that workstream lands. Swapping in the
// real values is a one-line change per constant.
const WHATSAPP_LINK = "#"; // TODO: read from settings table
const TELEGRAM_LINK = "#"; // TODO: read from settings table
const SUPPORT_EMAIL = "support@examprepstore.com"; // TODO: read from settings table

export const metadata: Metadata = {
  title: "Contact & Support — ExamPrep Store",
  description:
    "Having trouble logging in or viewing a PDF? Contact the ExamPrep Store administrator via WhatsApp, Telegram or email.",
  openGraph: {
    title: "Contact & Support — ExamPrep Store",
    description: "Get help with login, purchases or PDF viewing issues.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Contact &amp; Support</h1>
        <p className="mt-3 text-foreground/60">
          Having trouble logging in, completing a purchase, or viewing a PDF you bought? Reach
          out to the administrator using any of the channels below and we&apos;ll help you out.
        </p>
      </div>

      <Card className="mt-10 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a href={WHATSAPP_LINK} className="block">
            <Button variant="primary" size="lg" className="w-full">
              Chat on WhatsApp
            </Button>
          </a>
          <a href={TELEGRAM_LINK} className="block">
            <Button variant="secondary" size="lg" className="w-full">
              Join Telegram
            </Button>
          </a>
        </div>

        <div className="mt-6 border-t border-border-subtle pt-6 text-center">
          <p className="text-sm text-foreground/60">Prefer email?</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-1 inline-block font-medium text-brand-600 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </Card>

      <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-sm text-brand-700">
        <p className="font-semibold">Common issues</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-brand-700/90">
          <li>Forgot your password? Use the &quot;Forgot password&quot; link on the login page.</li>
          <li>Account locked after failed attempts? It unlocks automatically after 5 minutes.</li>
          <li>Logged out unexpectedly? Only one active session per account is allowed at a time.</li>
          <li>PDF not loading? Make sure your purchase is still within its validity period.</li>
        </ul>
      </div>
    </div>
  );
}
