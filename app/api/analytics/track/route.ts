import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventParams } = body as {
      eventName?: string;
      eventParams?: Record<string, unknown>;
    };

    if (!eventName) {
      return NextResponse.json(
        { error: "eventName is required" },
        { status: 400 },
      );
    }

    // Development-only structured logging. Production callers get an ack without
    // persisting to a third-party analytics backend (not configured yet).
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", eventName, eventParams ?? {});
    }

    return NextResponse.json({ success: true, eventName });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 },
    );
  }
}
