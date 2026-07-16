import { contactConfig } from "@/config/contact";
import { sendMail, type EmailResponse } from "@/lib/emailService";
import {
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

type AccountKind = "premium" | "business";
type AccountEvent =
  | "received"
  | "approved"
  | "rejected"
  | "downgraded";

const COPY: Record<
  AccountKind,
  Record<AccountEvent, { subject: string; title: string; body: string }>
> = {
  premium: {
    received: {
      subject: "Premium application received",
      title: "We received your Premium application",
      body: "Thanks for applying for Premium. Our team will review your request and email you once a decision is made.",
    },
    approved: {
      subject: "Your Premium account is active",
      title: "Premium approved",
      body: "Congratulations — your Premium account is now active. Enjoy your member benefits on your next order.",
    },
    rejected: {
      subject: "Premium application update",
      title: "Premium application not approved",
      body: "We reviewed your Premium application and were unable to approve it at this time. You can contact support if you have questions.",
    },
    downgraded: {
      subject: "Premium account update",
      title: "Premium access ended",
      body: "Your Premium account status has been updated and Premium benefits are no longer active on this account.",
    },
  },
  business: {
    received: {
      subject: "Business application received",
      title: "We received your Business application",
      body: "Thanks for applying for a Business account. Our team will review your request and email you once a decision is made.",
    },
    approved: {
      subject: "Your Business account is active",
      title: "Business account approved",
      body: "Congratulations — your Business account is now active. Your business pricing will apply on eligible orders.",
    },
    rejected: {
      subject: "Business application update",
      title: "Business application not approved",
      body: "We reviewed your Business application and were unable to approve it at this time. You can contact support if you have questions.",
    },
    downgraded: {
      subject: "Business account update",
      title: "Business access ended",
      body: "Your Business account status has been updated and business benefits are no longer active on this account.",
    },
  },
};

/** Account decision emails always send (system-critical). Application-received is informational and also always sends. */
export async function sendAccountStatusEmail(options: {
  email: string;
  customerName?: string;
  type: AccountKind;
  event: AccountEvent;
}): Promise<EmailResponse> {
  const copy = COPY[options.type][options.event];
  const name = options.customerName?.trim() || "there";
  const dashboardUrl = `${baseUrl()}/user/dashboard`;

  const html = wrapEmailLayout({
    title: copy.title,
    preheader: copy.subject,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(copy.title)}</h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">${escapeHtml(copy.body)}</p>
      ${primaryButton("Go to dashboard", dashboardUrl)}
    `,
  });

  return sendMail({
    email: options.email,
    subject: `[${company()}] ${copy.subject}`,
    text: `Hi ${name},\n\n${copy.body}\n\n${dashboardUrl}\n`,
    html,
  });
}
