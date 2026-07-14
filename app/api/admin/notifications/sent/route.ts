import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { readClient } from "@/sanity/lib/client";

const ALLOWED_TYPES = new Set([
  "promo",
  "order",
  "system",
  "marketing",
  "general",
]);
const ALLOWED_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const ALLOWED_DATE_FILTERS = new Set(["today", "week", "month"]);

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1),
      100,
    );
    const offset = Math.max(
      parseInt(searchParams.get("offset") || "0", 10) || 0,
      0,
    );
    const type = searchParams.get("type") || "";
    const priority = searchParams.get("priority") || "";
    const dateFilter = searchParams.get("dateFilter") || "";

    const params: Record<string, unknown> = {
      start: offset,
      end: offset + limit,
    };
    const conditions = [`_type == "sentNotification"`];

    if (type && type !== "all" && ALLOWED_TYPES.has(type)) {
      conditions.push(`type == $type`);
      params.type = type;
    }
    if (priority && priority !== "all" && ALLOWED_PRIORITIES.has(priority)) {
      conditions.push(`priority == $priority`);
      params.priority = priority;
    }

    if (dateFilter && dateFilter !== "all" && ALLOWED_DATE_FILTERS.has(dateFilter)) {
      const now = new Date();
      let sentAtFrom = "";

      if (dateFilter === "today") {
        sentAtFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).toISOString();
      } else if (dateFilter === "week") {
        sentAtFrom = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
      } else if (dateFilter === "month") {
        sentAtFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
      }

      if (sentAtFrom) {
        conditions.push(`sentAt >= $sentAtFrom`);
        params.sentAtFrom = sentAtFrom;
      }
    }

    const filter = conditions.join(" && ");
    const query = `*[${filter}] | order(sentAt desc) [$start...$end] {
      _id,
      notificationId,
      title,
      message,
      type,
      priority,
      sentAt,
      sentBy,
      actionUrl,
      recipientCount,
      recipients
    }`;
    const countQuery = `count(*[${filter}])`;

    const [notifications, totalCount] = await Promise.all([
      readClient.fetch(query, params),
      readClient.fetch(countQuery, params),
    ]);

    const transformedNotifications = notifications.map((notification: {
      _id: string;
      notificationId?: string;
      title?: string;
      message?: string;
      type?: string;
      priority?: string;
      sentAt?: string;
      sentBy?: string;
      actionUrl?: string;
      recipientCount?: number;
      recipients?: unknown[];
    }) => ({
      id: notification._id,
      notificationId: notification.notificationId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      sentAt: notification.sentAt,
      sentBy: notification.sentBy,
      actionUrl: notification.actionUrl,
      recipientCount: notification.recipientCount,
      recipients: notification.recipients || [],
    }));

    return NextResponse.json({
      notifications: transformedNotifications,
      totalCount,
      hasNextPage: offset + limit < totalCount,
      pagination: {
        limit,
        offset,
        total: totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching sent notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
