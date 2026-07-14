import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/adminUtils";

export async function requireAdminUser() {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 },
      ),
    };
  }

  const clerk = await clerkClient();
  const currentUser = await clerk.users.getUser(userId);
  const userEmail = currentUser.primaryEmailAddress?.emailAddress;

  if (!userEmail || !isUserAdmin(userEmail)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { userId, userEmail };
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
