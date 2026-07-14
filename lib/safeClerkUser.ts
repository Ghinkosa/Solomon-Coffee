import {
  auth,
  currentUser,
  clerkClient,
  type User,
} from "@clerk/nextjs/server";

export type SafeClerkUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: Array<{ emailAddress: string }>;
  primaryEmailAddress: { emailAddress: string } | null;
};

function toSafeUser(user: User): SafeClerkUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    emailAddresses: user.emailAddresses.map((email) => ({
      emailAddress: email.emailAddress,
    })),
    primaryEmailAddress: user.primaryEmailAddress
      ? { emailAddress: user.primaryEmailAddress.emailAddress }
      : null,
  };
}

/**
 * Resolve the signed-in Clerk user without crashing the RSC tree when
 * Clerk's Backend API is slow / unreachable (`fetch failed`).
 */
export async function getSafeClerkUser(): Promise<SafeClerkUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const user = await currentUser();
    if (user) return toSafeUser(user);
  } catch (error) {
    console.error("[clerk] currentUser() failed; trying clerkClient", error);
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    return toSafeUser(user);
  } catch (error) {
    console.error("[clerk] clerkClient.users.getUser() failed", error);
    return null;
  }
}

export function getSafeClerkEmail(user: SafeClerkUser | null): string | null {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null
  );
}
