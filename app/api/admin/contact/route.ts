import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

const PROJECTION = `{
  _id,
  _createdAt,
  name,
  email,
  subject,
  message,
  status,
  priority,
  submittedAt,
  ipAddress
}`;

const STATUSES = ["new", "read", "replied", "closed"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    if (id) {
      const message = await writeClient.fetch(
        `*[_type == "contact" && _id == $id][0] ${PROJECTION}`,
        { id },
      );
      if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }
      return NextResponse.json({ message });
    }

    const params: Record<string, unknown> = {};
    let filter = `_type == "contact"`;
    if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
      filter += ` && status == $status`;
      params.status = status;
    }
    if (search) {
      filter += ` && (
        name match $search ||
        email match $search ||
        subject match $search ||
        message match $search
      )`;
      params.search = `${search}*`;
    }

    const messages = await writeClient.fetch(
      `*[${filter}] | order(coalesce(submittedAt, _createdAt) desc) ${PROJECTION}`,
      params,
    );

    const counts = await writeClient.fetch(`{
      "all": count(*[_type == "contact"]),
      "new": count(*[_type == "contact" && status == "new"]),
      "read": count(*[_type == "contact" && status == "read"]),
      "replied": count(*[_type == "contact" && status == "replied"]),
      "closed": count(*[_type == "contact" && status == "closed"])
    }`);

    return NextResponse.json({
      messages: messages || [],
      counts,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const body = await req.json();
    const { messageId, status, priority } = body as {
      messageId?: string;
      status?: string;
      priority?: string;
    };

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 },
      );
    }

    const patch: Record<string, string> = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = status;
    }
    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority as (typeof PRIORITIES)[number])) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      patch.priority = priority;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 },
      );
    }

    const existing = await writeClient.fetch(
      `*[_type == "contact" && _id == $id][0]{ _id }`,
      { id: messageId },
    );
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await writeClient.patch(messageId).set(patch).commit();

    const message = await writeClient.fetch(
      `*[_type == "contact" && _id == $id][0] ${PROJECTION}`,
      { id: messageId },
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "contact" && _id == $id][0]{ _id }`,
      { id },
    );
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await writeClient.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
