import { emailShell } from "@/lib/email/templates/shared";

export function sessionAlertEmailHtml(deviceLabel: string): string {
  return emailShell(
    "You were logged out of another device",
    `<p style="font-size:14px;color:#4b5563;">Your account was just signed in from a new device (${deviceLabel}). Since only one active session is allowed at a time, any other session was automatically signed out.</p>
     <p style="font-size:13px;color:#9ca3af;">If this wasn't you, please contact our support immediately via WhatsApp or Telegram, or change your password.</p>`
  );
}
