import { emailShell, emailButton } from "@/lib/email/templates/shared";

export function welcomeEmailHtml(fullName: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return emailShell(
    `Welcome aboard, ${fullName}! 🎉`,
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">
       Your account has been created successfully. You now have access to exam-ready PDF notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE.
     </p>
     ${emailButton(`${siteUrl}/pricing`, "Browse Exam Bundles →")}
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;background:#f9fafb;border-radius:10px;">
       <tr>
         <td style="padding:16px 18px;">
           <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#374151;">A few things to know:</p>
           <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:13px;color:#6b7280;line-height:1.8;">
             <tr><td style="vertical-align:top;padding-right:8px;">🔒</td><td>Your account can only be logged in from <strong>one device at a time</strong> — logging in elsewhere signs you out automatically.</td></tr>
             <tr><td style="vertical-align:top;padding-right:8px;">📄</td><td>PDFs are view-only and watermarked with your details — downloading isn't supported by design.</td></tr>
             <tr><td style="vertical-align:top;padding-right:8px;">💬</td><td>Need help? Reach us anytime via WhatsApp or Telegram from your dashboard.</td></tr>
           </table>
         </td>
       </tr>
     </table>`,
    { preheader: `Welcome ${fullName}! Your account is ready — start browsing exam bundles.` }
  );
}
