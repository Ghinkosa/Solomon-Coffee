import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromNewsletter } from "@/actions/subscriptionActions";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rate = checkRateLimit(
      `newsletter-unsub:${ipAddress}`,
      LIMIT,
      WINDOW_MS,
    );
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
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

    const result = await unsubscribeFromNewsletter(email);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    try {
      const { sendNewsletterUnsubscribedEmail } = await import(
        "@/lib/emails/newsletterEmails"
      );
      await sendNewsletterUnsubscribedEmail(email);
    } catch (emailError) {
      console.error("Failed to send unsubscribe confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Newsletter unsubscribe API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
