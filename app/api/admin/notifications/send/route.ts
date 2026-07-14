import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import {
  sendBulkNotifications,
  NotificationType,
  NotificationPriority,
} from "@/lib/notificationService";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = await req.json();

    const {
      title,
      message,
      type = "general",
      priority = "medium",
      actionUrl,
      recipients, // Array of Clerk user IDs
      sentBy,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Missing required field: message" },
        { status: 400 }
      );
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      );
    }

    // Send bulk notifications using the notification service
    const result = await sendBulkNotifications(recipients, {
      title,
      message,
      type: type as NotificationType,
      priority: priority as NotificationPriority,
      actionUrl,
      sentBy: sentBy || admin.userEmail,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to send notifications",
          historyCreated: result.historyCreated ?? false,
          stats: {
            total: result.total ?? recipients.length,
            successful: result.successful ?? 0,
            failed: result.failed ?? recipients.length,
          },
        },
        { status: 500 },
      );
    }

    const failed = result.failed ?? 0;
    const successful = result.successful ?? 0;
    const responseMessage =
      failed > 0
        ? `Delivered to ${successful} of ${result.total} recipients (${failed} failed)`
        : "Notifications sent successfully";

    return NextResponse.json({
      success: true,
      message: responseMessage,
      historyCreated: result.historyCreated ?? false,
      stats: {
        total: result.total,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
