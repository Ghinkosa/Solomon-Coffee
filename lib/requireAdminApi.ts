import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/adminUtils";

export type AdminApiContext = {
  userId: string;
  email: string;
};

export async function requireAdminApi(): Promise<AdminApiContext | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  if (!email || !isUserAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId, email };
}

export function isAdminApiError(
  result: AdminApiContext | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
