import { emailShell, emailButton } from "@/lib/email/templates/shared";

export function sessionAlertEmailHtml(deviceLabel: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return emailShell(
    "New sign-in to your account",
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">
       Your account was just signed in from a new device: <strong>${deviceLabel}</strong>.
     </p>
     <p style="font-size:14px;color:#4b5563;line-height:1.6;">
       Since only one active session is allowed at a time, any other session was automatically signed out.
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#fffbeb;border-radius:10px;">
       <tr>
         <td style="padding:14px 18px;font-size:13px;color:#92400e;line-height:1.6;">
           ⚠️ <strong>Wasn't you?</strong> Reset your password immediately and contact support via WhatsApp or Telegram.
         </td>
       </tr>
     </table>
     ${emailButton(`${siteUrl}/forgot-password`, "Reset Password →")}`,
    { preheader: `New sign-in detected from ${deviceLabel}. Wasn't you? Secure your account now.` }
  );
}
