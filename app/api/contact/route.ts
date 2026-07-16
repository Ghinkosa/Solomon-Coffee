import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage } from "@/sanity/helpers";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rate = checkRateLimit(`contact:${ipAddress}`, LIMIT, WINDOW_MS);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Too many messages. Please try again later.",
          retryAfterSeconds: rate.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await saveContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      userAgent,
    });

    if (result.success) {
      try {
        const { notifyAdminsContactMessage } = await import(
          "@/lib/emails/adminEmails"
        );
        const { sendContactAutoReply } = await import(
          "@/lib/emails/newsletterEmails"
        );
        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        await Promise.allSettled([
          notifyAdminsContactMessage({
            name: trimmedName,
            email: normalizedEmail,
            subject: subject.trim(),
            message: message.trim(),
          }),
          sendContactAutoReply({
            name: trimmedName,
            email: normalizedEmail,
          }),
        ]);
      } catch (emailError) {
        console.error("Contact email notifications failed:", emailError);
      }

      return NextResponse.json(
        {
          message: "Message sent successfully! We'll get back to you soon.",
          id: result.data?._id,
        },
        { status: 200 },
      );
    }

    console.error("Sanity save failed:", result.error);
    return NextResponse.json(
      { error: result.error || "Failed to send message. Please try again." },
      { status: 500 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
