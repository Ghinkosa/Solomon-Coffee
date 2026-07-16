import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/actions/subscriptionActions";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rate = checkRateLimit(`newsletter-sub:${ipAddress}`, LIMIT, WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Too many subscription attempts. Please try again later.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await subscribeToNewsletter({
      email,
      source: "footer",
      ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          alreadySubscribed: result.alreadySubscribed || false,
        },
        { status: result.alreadySubscribed ? 200 : 400 },
      );
    }

    try {
      const { sendNewsletterWelcomeEmail } = await import(
        "@/lib/emails/newsletterEmails"
      );
      const emailResult = await sendNewsletterWelcomeEmail(email);
      if (!emailResult.success) {
        console.error("Failed to send welcome email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json(
      {
        message: result.message,
        subscriptionId: result.data?.subscriptionId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Newsletter subscription API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
