export function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;">Course and Notes Purchasing App</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1f2937;">
                <h2 style="margin:0 0 16px;font-size:18px;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;">
                If you did not request this, please contact our support immediately.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
