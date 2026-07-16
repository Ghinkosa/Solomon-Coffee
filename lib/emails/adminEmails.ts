import { contactConfig } from "@/config/contact";
import { sendMailToAdmins, type EmailResponse } from "@/lib/emailService";
import {
  detailRow,
  escapeHtml,
  primaryButton,
  wrapEmailLayout,
} from "@/lib/emails/layout";

const company = () => contactConfig.company.name;
const baseUrl = () =>
  (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );

function adminResult(
  result: Awaited<ReturnType<typeof sendMailToAdmins>>,
): EmailResponse {
  return {
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  };
}

export async function notifyAdminsNewOrder(options: {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}): Promise<EmailResponse> {
  const adminOrdersUrl = `${baseUrl()}/admin/orders`;
  const totalLabel =
    typeof options.total === "number"
      ? `$${options.total.toFixed(2)}`
      : "—";

  const html = wrapEmailLayout({
    title: "New order",
    preheader: `New order #${options.orderNumber}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">New order received</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">A new order needs attention in the admin console.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Order", `#${escapeHtml(options.orderNumber)}`)}
        ${detailRow("Customer", escapeHtml(options.customerName || "—"))}
        ${detailRow("Email", escapeHtml(options.customerEmail || "—"))}
        ${detailRow("Total", escapeHtml(totalLabel))}
        ${detailRow("Payment", escapeHtml(options.paymentMethod || "—"))}
        ${detailRow("Pay status", escapeHtml(options.paymentStatus || "—"))}
      </table>
      ${primaryButton("Open admin orders", adminOrdersUrl)}
    `,
  });

  return adminResult(
    await sendMailToAdmins({
      subject: `[${company()}] New order #${options.orderNumber}`,
      text: `New order #${options.orderNumber}\nCustomer: ${options.customerName || "—"}\nEmail: ${options.customerEmail || "—"}\nTotal: ${totalLabel}\n${adminOrdersUrl}`,
      html,
    }),
  );
}

export async function notifyAdminsCancellationRequest(options: {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  reason?: string;
}): Promise<EmailResponse> {
  const adminOrdersUrl = `${baseUrl()}/admin/orders`;
  const html = wrapEmailLayout({
    title: "Cancellation request",
    preheader: `Cancellation requested for #${options.orderNumber}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">Cancellation requested</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">A customer requested to cancel an order.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Order", `#${escapeHtml(options.orderNumber)}`)}
        ${detailRow("Customer", escapeHtml(options.customerName || "—"))}
        ${detailRow("Email", escapeHtml(options.customerEmail || "—"))}
        ${detailRow("Reason", escapeHtml(options.reason || "Not provided"))}
      </table>
      ${primaryButton("Review in admin", adminOrdersUrl)}
    `,
  });

  return adminResult(
    await sendMailToAdmins({
      subject: `[${company()}] Cancellation request #${options.orderNumber}`,
      text: `Cancellation requested for #${options.orderNumber}\n${options.reason || ""}\n${adminOrdersUrl}`,
      html,
    }),
  );
}

export async function notifyAdminsContactMessage(options: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<EmailResponse> {
  const html = wrapEmailLayout({
    title: "Contact form",
    preheader: `New message from ${options.name}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">New contact message</h1>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Name", escapeHtml(options.name))}
        ${detailRow("Email", escapeHtml(options.email))}
        ${detailRow("Subject", escapeHtml(options.subject))}
      </table>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(options.message)}</p>
    `,
  });

  return adminResult(
    await sendMailToAdmins({
      subject: `[${company()}] Contact: ${options.subject}`,
      text: `From: ${options.name} <${options.email}>\nSubject: ${options.subject}\n\n${options.message}`,
      html,
    }),
  );
}

export async function notifyAdminsWholesaleInquiry(options: {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  message?: string;
}): Promise<EmailResponse> {
  const html = wrapEmailLayout({
    title: "Wholesale inquiry",
    preheader: `Wholesale inquiry from ${options.businessName}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">New wholesale inquiry</h1>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Business", escapeHtml(options.businessName))}
        ${detailRow("Contact", escapeHtml(options.contactName))}
        ${detailRow("Email", escapeHtml(options.email))}
        ${detailRow("Phone", escapeHtml(options.phone || "—"))}
      </table>
      ${
        options.message
          ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(options.message)}</p>`
          : ""
      }
      ${primaryButton("Open wholesale admin", `${baseUrl()}/admin/wholesale`)}
    `,
  });

  return adminResult(
    await sendMailToAdmins({
      subject: `[${company()}] Wholesale inquiry: ${options.businessName}`,
      text: `Wholesale inquiry\n${options.businessName}\n${options.contactName}\n${options.email}\n${options.message || ""}`,
      html,
    }),
  );
}

export async function notifyAdminsAccountApplication(options: {
  type: "premium" | "business";
  customerName?: string;
  customerEmail: string;
}): Promise<EmailResponse> {
  const label = options.type === "premium" ? "Premium" : "Business";
  const html = wrapEmailLayout({
    title: `${label} application`,
    preheader: `New ${label.toLowerCase()} application`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">New ${escapeHtml(label)} application</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">A customer applied for a ${escapeHtml(label.toLowerCase())} account.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0;width:100%;">
        ${detailRow("Name", escapeHtml(options.customerName || "—"))}
        ${detailRow("Email", escapeHtml(options.customerEmail))}
        ${detailRow("Type", escapeHtml(label))}
      </table>
      ${primaryButton("Review requests", `${baseUrl()}/admin/users`)}
    `,
  });

  return adminResult(
    await sendMailToAdmins({
      subject: `[${company()}] ${label} application — ${options.customerEmail}`,
      text: `New ${label} application from ${options.customerEmail}`,
      html,
    }),
  );
}
