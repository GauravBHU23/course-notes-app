import { emailShell } from "@/lib/email/templates/shared";

export function passwordResetEmailHtml(code: string): string {
  return emailShell(
    "Reset your password",
    `<p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 4px;">
       Use the code below to reset your password. It expires in <strong>5 minutes</strong>.
     </p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
       <tr>
         <td align="center">
           <table role="presentation" cellpadding="0" cellspacing="0">
             <tr>
               ${code
                 .split("")
                 .map(
                   (digit) =>
                     `<td style="width:44px;height:56px;background:#fef2f2;border-radius:10px;text-align:center;vertical-align:middle;font-size:26px;font-weight:bold;color:#b91c1c;font-family:Arial,Helvetica,sans-serif;">${digit}</td><td style="width:8px;"></td>`
                 )
                 .join("")}
             </tr>
           </table>
         </td>
       </tr>
     </table>
     <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
       If you didn't request a password reset, you can safely ignore this email — your password will not be changed unless this code is used.
     </p>`,
    { preheader: `Your password reset code is ${code}. It expires in 5 minutes.` }
  );
}
