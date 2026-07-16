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

export async function sendNewsletterWelcomeEmail(
  email: string,
): Promise<EmailResponse> {
  const shopUrl = `${baseUrl()}/shop`;
  const html = wrapEmailLayout({
    title: "Welcome to our newsletter",
    preheader: `Thanks for subscribing to ${company()}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">You're subscribed</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
        Thank you for joining the ${escapeHtml(company())} newsletter. Expect farm stories, offers, and brew tips — never spam.
      </p>
      ${primaryButton("Shop coffee", shopUrl)}
    `,
  });

  return sendMail({
    email,
    subject: `[${company()}] Welcome to our newsletter`,
    text: `Thanks for subscribing to ${company()}.\n\nShop: ${shopUrl}\n`,
    html,
  });
}

export async function sendNewsletterUnsubscribedEmail(
  email: string,
): Promise<EmailResponse> {
  const html = wrapEmailLayout({
    title: "Unsubscribed",
    preheader: "You have been unsubscribed from our newsletter",
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">You're unsubscribed</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
        We've removed <strong>${escapeHtml(email)}</strong> from our marketing list. You can resubscribe anytime from the website footer or your account settings.
      </p>
      ${primaryButton("Visit shop", `${baseUrl()}/shop`)}
    `,
  });

  return sendMail({
    email,
    subject: `[${company()}] Newsletter unsubscribed`,
    text: `You've been unsubscribed from the ${company()} newsletter (${email}).`,
    html,
  });
}

export async function sendContactAutoReply(options: {
  name: string;
  email: string;
}): Promise<EmailResponse> {
  const html = wrapEmailLayout({
    title: "We received your message",
    preheader: "Thanks for contacting us",
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">Message received</h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">Hi ${escapeHtml(options.name)},</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
        Thanks for reaching out to ${escapeHtml(company())}. Our team will review your message and get back to you soon.
      </p>
    `,
  });

  return sendMail({
    email: options.email,
    subject: `[${company()}] We received your message`,
    text: `Hi ${options.name},\n\nThanks for contacting ${company()}. We'll get back to you soon.\n`,
    html,
  });
}

export async function sendWholesaleAutoReply(options: {
  contactName: string;
  email: string;
  businessName: string;
}): Promise<EmailResponse> {
  const html = wrapEmailLayout({
    title: "Wholesale inquiry received",
    preheader: "Thanks for your wholesale interest",
    bodyHtml: `
      <h1 style="margin:0 0 12px;font-size:24px;">Inquiry received</h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">Hi ${escapeHtml(options.contactName)},</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;">
        Thanks for your interest in wholesale with ${escapeHtml(company())} for <strong>${escapeHtml(options.businessName)}</strong>. Our sales team will follow up shortly.
      </p>
    `,
  });

  return sendMail({
    email: options.email,
    subject: `[${company()}] Wholesale inquiry received`,
    text: `Hi ${options.contactName},\n\nThanks for your wholesale inquiry for ${options.businessName}. We'll follow up soon.\n`,
    html,
  });
}
