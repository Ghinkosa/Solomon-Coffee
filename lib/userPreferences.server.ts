import { writeClient } from "@/sanity/lib/client";
import {
  normalizeNotificationPreferences,
  type NotificationChannelPreference,
  type StoredUserPreferences,
} from "@/lib/userPreferences";

const USER_PREFS_PROJECTION = `{
  _id,
  email,
  preferences
}`;

export async function getUserPreferencesByClerkId(clerkUserId: string): Promise<{
  userId: string | null;
  email: string | null;
  preferences: NotificationChannelPreference;
  raw: StoredUserPreferences | null;
} | null> {
  const user = await writeClient.fetch(
    `*[_type in ["user", "userType"] && clerkUserId == $clerkUserId][0] ${USER_PREFS_PROJECTION}`,
    { clerkUserId },
  );

  if (!user?._id) return null;

  return {
    userId: user._id,
    email: user.email || null,
    preferences: normalizeNotificationPreferences(user.preferences),
    raw: user.preferences || null,
  };
}

export async function getUserPreferencesByEmail(email: string): Promise<{
  userId: string | null;
  preferences: NotificationChannelPreference;
  raw: StoredUserPreferences | null;
} | null> {
  const normalized = email.toLowerCase().trim();
  const user = await writeClient.fetch(
    `*[_type in ["user", "userType"] && email == $email][0] ${USER_PREFS_PROJECTION}`,
    { email: normalized },
  );

  if (!user?._id) return null;

  return {
    userId: user._id,
    preferences: normalizeNotificationPreferences(user.preferences),
    raw: user.preferences || null,
  };
}

/**
 * Patch allowlisted notification preferences on the authenticated user's doc.
 * Keeps `newsletter` in sync with `marketingEmails` for legacy readers.
 */
export async function updateUserNotificationPreferences(
  clerkUserId: string,
  patch: Partial<NotificationChannelPreference>,
): Promise<{
  preferences: NotificationChannelPreference;
  email: string | null;
  marketingChanged: boolean;
}> {
  const existing = await getUserPreferencesByClerkId(clerkUserId);
  if (!existing?.userId) {
    throw new Error("USER_NOT_FOUND");
  }

  const previous = existing.preferences;
  const next = normalizeNotificationPreferences({
    ...existing.raw,
    ...existing.preferences,
    ...patch,
  });

  await writeClient
    .patch(existing.userId)
    .set({
      preferences: {
        ...(existing.raw || {}),
        emailNotifications: next.emailNotifications,
        orderUpdates: next.orderUpdates,
        marketingEmails: next.marketingEmails,
        newsletter: next.marketingEmails,
      },
      updatedAt: new Date().toISOString(),
    })
    .commit();

  return {
    preferences: next,
    email: existing.email,
    marketingChanged: previous.marketingEmails !== next.marketingEmails,
  };
}
