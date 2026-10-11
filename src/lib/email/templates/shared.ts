const BRAND_NAME = "Course and Notes Purchasing App";
const BRAND_GRADIENT = "linear-gradient(135deg,#4f46e5,#7c3aed)";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export interface EmailShellOptions {
  preheader?: string;
  footerNote?: string;
}

/**
 * Responsive email shell: fluid width (max-width + width:100% rather than a
 * fixed px table) so it scales down cleanly on phone-width email clients,
 * a real viewport meta + media query for the few clients that honor them
 * (most modern mobile mail apps), and a hidden preheader snippet (the
 * preview text shown next to the subject line in inbox lists).
 */
export function emailShell(title: string, bodyHtml: string, options: EmailShellOptions = {}): string {
  const { preheader, footerNote } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .email-header-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f2f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f2f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td class="email-header-padding" style="background:${BRAND_GRADIENT};padding:28px 32px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:9px;text-align:center;vertical-align:middle;font-size:14px;font-weight:bold;color:#ffffff;">
                    CN
                  </td>
                  <td style="padding-left:10px;color:#ffffff;font-size:18px;font-weight:bold;vertical-align:middle;">
                    ${BRAND_NAME}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:36px 32px;color:#1f2937;">
              <h1 style="margin:0 0 18px;font-size:20px;line-height:1.3;color:#111827;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="email-padding" style="padding:20px 32px;background:#f9fafb;border-top:1px solid #eef0f3;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.6;">
                ${footerNote ?? "If you did not request this, please contact our support immediately via WhatsApp or Telegram."}
              </p>
              <p style="margin:0;font-size:11px;color:#c0c4cc;">
                &copy; ${new Date().getFullYear()} ${BRAND_NAME} &middot;
                <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:underline;">Visit website</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background:${BRAND_GRADIENT};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}
