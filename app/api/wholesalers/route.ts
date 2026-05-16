import { NextRequest, NextResponse } from "next/server";
import { saveWholesaleInquiry } from "@/sanity/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
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

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await saveWholesaleInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ipAddress,
      userAgent,
    });

    if (result.success) {
      return NextResponse.json(
        {
          message:
            "Thank you! Our wholesale team will reach out to you shortly.",
          id: result.data?._id,
        },
        { status: 200 },
      );
    }

    console.error("Wholesale inquiry save failed:", result.error);
    return NextResponse.json(
      {
        error:
          result.error || "Failed to submit your inquiry. Please try again.",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Wholesale API Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
