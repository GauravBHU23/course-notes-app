import { emailShell, emailButton } from "@/lib/email/templates/shared";

export function invoiceEmailHtml(params: {
  fullName: string;
  bundleTitle: string;
  amountInr: number;
  invoiceNumber: string;
  accessExpiresAt: string;
}): string {
  const expiryDate = new Date(params.accessExpiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return emailShell(
    "Payment successful ✅",
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">
       Hi ${params.fullName}, your payment went through and access has been activated immediately.
     </p>

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border:1px solid #eef0f3;border-radius:12px;overflow:hidden;">
       <tr>
         <td style="background:#f9fafb;padding:14px 18px;border-bottom:1px solid #eef0f3;">
           <span style="font-size:13px;font-weight:bold;color:#374151;">Order summary</span>
         </td>
       </tr>
       <tr>
         <td style="padding:16px 18px;">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1f2937;">
             <tr>
               <td style="padding:6px 0;color:#6b7280;">Bundle</td>
               <td style="padding:6px 0;text-align:right;"><strong>${params.bundleTitle}</strong></td>
             </tr>
             <tr>
               <td style="padding:6px 0;color:#6b7280;">Invoice number</td>
               <td style="padding:6px 0;text-align:right;">${params.invoiceNumber}</td>
             </tr>
             <tr>
               <td style="padding:6px 0;color:#6b7280;">Access valid until</td>
               <td style="padding:6px 0;text-align:right;">${expiryDate}</td>
             </tr>
             <tr>
               <td colspan="2" style="padding-top:10px;border-top:1px solid #eef0f3;"></td>
             </tr>
             <tr>
               <td style="padding:8px 0 0;font-size:15px;font-weight:bold;color:#111827;">Total paid</td>
               <td style="padding:8px 0 0;text-align:right;font-size:20px;font-weight:bold;color:#4f46e5;">₹${params.amountInr}</td>
             </tr>
           </table>
         </td>
       </tr>
     </table>

     ${emailButton(`${siteUrl}/dashboard/my-bundles`, "View My Bundles →")}

     <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:8px 0 0;">
       A detailed tax invoice (PDF) is attached to this email for your records. If you have any questions about this purchase, reach us via WhatsApp or Telegram from your dashboard.
     </p>`,
    { preheader: `Payment of ₹${params.amountInr} confirmed for ${params.bundleTitle}. Access is now active.` }
  );
}
