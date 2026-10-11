import { emailShell } from "@/lib/email/templates/shared";

export function contactQueryEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return emailShell(
    "New contact form query",
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">
       A student submitted a query through the contact form.
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border:1px solid #eef0f3;border-radius:12px;overflow:hidden;">
       <tr>
         <td style="padding:16px 18px;">
           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#1f2937;">
             <tr>
               <td style="padding:6px 0;color:#6b7280;width:90px;vertical-align:top;">Name</td>
               <td style="padding:6px 0;"><strong>${params.name}</strong></td>
             </tr>
             <tr>
               <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Email</td>
               <td style="padding:6px 0;"><a href="mailto:${params.email}" style="color:#4f46e5;">${params.email}</a></td>
             </tr>
             <tr>
               <td style="padding:6px 0;color:#6b7280;vertical-align:top;">Subject</td>
               <td style="padding:6px 0;"><strong>${params.subject}</strong></td>
             </tr>
           </table>
         </td>
       </tr>
       <tr>
         <td style="background:#f9fafb;padding:16px 18px;border-top:1px solid #eef0f3;">
           <p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Message</p>
           <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6;white-space:pre-wrap;">${params.message}</p>
         </td>
       </tr>
     </table>
     <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
       Reply directly to this email or reach out to ${params.email} to respond to this query.
     </p>`,
    { preheader: `${params.name}: ${params.subject}` }
  );
}
