import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/adminGate";

export async function requireAdminUser() {
  const { userId } = await auth();
  const gate = await resolveAdminAccess(userId);

  if (gate.status === "unauthenticated") {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 },
      ),
    };
  }

  if (gate.status === "denied") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      ),
    };
  }

  if (gate.status === "unavailable") {
    return {
      error: NextResponse.json(
        {
          error: "Auth service temporarily unavailable",
          message: "Could not verify admin access. Please retry.",
        },
        { status: 503 },
      ),
    };
  }

  return { userId: gate.userId, userEmail: gate.email };
}

export function makeKey(prefix = "k") {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
