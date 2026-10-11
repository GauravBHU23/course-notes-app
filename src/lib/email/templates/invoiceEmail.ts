import { emailShell } from "@/lib/email/templates/shared";

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

  return emailShell(
    "Purchase confirmed",
    `<p style="font-size:14px;color:#4b5563;">Hi ${params.fullName}, your payment was successful and access has been activated.</p>
     <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;color:#1f2937;margin:16px 0;">
       <tr><td style="color:#6b7280;">Bundle</td><td align="right"><strong>${params.bundleTitle}</strong></td></tr>
       <tr><td style="color:#6b7280;">Amount paid</td><td align="right"><strong>₹${params.amountInr}</strong></td></tr>
       <tr><td style="color:#6b7280;">Invoice number</td><td align="right"><strong>${params.invoiceNumber}</strong></td></tr>
       <tr><td style="color:#6b7280;">Access valid until</td><td align="right"><strong>${expiryDate}</strong></td></tr>
     </table>
     <p style="font-size:13px;color:#9ca3af;">Your invoice is attached as a PDF. You can view your purchased content anytime from your dashboard.</p>`
  );
}
