import { contactConfig } from "@/config/contact";

const brand = {
  dark: "#3d2b1f",
  green: "#3b9c3c",
  orange: "#fb6c08",
  cream: "#faf8f5",
  muted: "#6b5a4e",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function wrapEmailLayout(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
}): string {
  const company = contactConfig.company.name;
  const support = contactConfig.emails.support;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.cream};font-family:Georgia,'Times New Roman',serif;color:${brand.dark};">
  ${preheader}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.cream};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e0d0;">
          <tr>
            <td style="background:${brand.dark};padding:20px 28px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:0.02em;">${escapeHtml(company)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:${brand.cream};border-top:1px solid #e8e0d0;font-size:13px;color:${brand.muted};line-height:1.5;">
              <p style="margin:0 0 8px;">Questions? Contact us at <a href="mailto:${escapeHtml(support)}" style="color:${brand.green};">${escapeHtml(support)}</a></p>
              <p style="margin:0;"><a href="${baseUrl}" style="color:${brand.orange};text-decoration:none;">Visit our shop</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function primaryButton(label: string, href: string): string {
  return `<p style="margin:24px 0 0;">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:${brand.orange};color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;">${escapeHtml(label)}</a>
</p>`;
}

export function detailRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:${brand.muted};width:140px;vertical-align:top;">${escapeHtml(label)}</td>
  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;color:${brand.dark};">${value}</td>
</tr>`;
}
