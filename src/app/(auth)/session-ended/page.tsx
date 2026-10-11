import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Session ended | ExamPrep Store" };

export default async function SessionEndedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  const message =
    reason === "session_ended"
      ? "Your account was logged in from another device or browser. For security, only one active session is allowed at a time, so you have been signed out here."
      : "You need to log in to continue.";

  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
        🔒
      </div>
      <h1 className="mb-2 text-lg font-bold">You&apos;ve been signed out</h1>
      <p className="mb-6 text-sm text-foreground/70">{message}</p>
      <Link href="/login">
        <Button className="w-full">Log in again</Button>
      </Link>
      <p className="mt-6 text-xs text-foreground/50">
        Not you? Contact the administrator via WhatsApp or Telegram immediately.
      </p>
    </Card>
  );
}
