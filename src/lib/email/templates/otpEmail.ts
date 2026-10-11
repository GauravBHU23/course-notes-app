import { emailShell } from "@/lib/email/templates/shared";

export function otpEmailHtml(code: string): string {
  return emailShell(
    "Your one-time login code",
    `<p style="font-size:14px;color:#4b5563;">Use the code below to log in. It expires in 5 minutes.</p>
     <div style="margin:24px 0;text-align:center;">
       <span style="display:inline-block;padding:16px 24px;background:#eef2ff;color:#4f46e5;font-size:28px;font-weight:bold;letter-spacing:6px;border-radius:8px;">${code}</span>
     </div>
     <p style="font-size:13px;color:#9ca3af;">Never share this code with anyone, including someone claiming to be support staff.</p>`
  );
}
