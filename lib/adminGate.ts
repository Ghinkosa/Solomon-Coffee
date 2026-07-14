import { clerkClient, type User } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";

export type AdminGateResult =
  | { status: "admin"; userId: string; email: string; user: User }
  | { status: "denied"; userId: string; email: string | null }
  | { status: "unauthenticated" }
  | { status: "unavailable"; userId: string; reason: string };

function emailsOnUser(user: User): string[] {
  const emails = new Set<string>();
  if (user.primaryEmailAddress?.emailAddress) {
    emails.add(user.primaryEmailAddress.emailAddress);
  }
  for (const entry of user.emailAddresses ?? []) {
    if (entry.emailAddress) emails.add(entry.emailAddress);
  }
  return [...emails];
}

export function pickAdminEmail(user: User): string | null {
  for (const email of emailsOnUser(user)) {
    if (isUserAdmin(email)) return email;
  }
  return null;
}

/**
 * Resolve admin access for a signed-in Clerk userId.
 * Distinguishes "not an admin" from "Clerk API unreachable".
 */
export async function resolveAdminAccess(
  userId: string | null | undefined,
): Promise<AdminGateResult> {
  if (!userId) return { status: "unauthenticated" };

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const adminEmail = pickAdminEmail(user);

    if (adminEmail) {
      return { status: "admin", userId, email: adminEmail, user };
    }

    return {
      status: "denied",
      userId,
      email:
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress ??
        null,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Clerk user lookup failed";
    console.error("[admin-gate] Clerk lookup unavailable:", reason);
    return { status: "unavailable", userId, reason };
  }
}
