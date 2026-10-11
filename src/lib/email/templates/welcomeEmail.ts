import { emailShell } from "@/lib/email/templates/shared";

export function welcomeEmailHtml(fullName: string): string {
  return emailShell(
    `Welcome, ${fullName}!`,
    `<p style="font-size:14px;color:#4b5563;">Your account has been created successfully. You can now browse exam bundles and purchase access to notes and practice sets.</p>
     <p style="font-size:13px;color:#9ca3af;">Remember: your account can only be logged in from one device at a time. Logging in elsewhere will sign you out of your current session automatically.</p>`
  );
}
