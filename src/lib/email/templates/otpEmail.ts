import { emailShell } from "@/lib/email/templates/shared";

export function otpEmailHtml(code: string): string {
  return emailShell(
    "Your one-time login code",
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">Use the code below to continue. It expires in <strong>5 minutes</strong>.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
       <tr>
         <td align="center">
           <table role="presentation" cellpadding="0" cellspacing="0">
             <tr>
               ${code
                 .split("")
                 .map(
                   (digit) =>
                     `<td style="width:44px;height:56px;background:#eef2ff;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:bold;color:#4f46e5;font-family:Arial,Helvetica,sans-serif;">${digit}</td><td style="width:8px;"></td>`
                 )
                 .join("")}
             </tr>
           </table>
         </td>
       </tr>
     </table>
     <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
       Never share this code with anyone, including someone claiming to be support staff. We will never ask for your OTP over phone or chat.
     </p>`,
    { preheader: `Your one-time code is ${code}. It expires in 5 minutes.` }
  );
}
