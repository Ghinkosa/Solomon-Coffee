/**
 * User notification / communication preferences (client-safe).
 * Defaults follow common commerce practice:
 * - transactional & order updates: opt-out (on by default)
 * - marketing: opt-in (off by default)
 */

export type NotificationChannelPreference = {
  emailNotifications: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
};

export type StoredUserPreferences = Partial<NotificationChannelPreference> & {
  newsletter?: boolean;
  smsNotifications?: boolean;
  preferredCurrency?: string;
  preferredLanguage?: string;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationChannelPreference = {
  emailNotifications: true,
  orderUpdates: true,
  marketingEmails: false,
};

/** Full preferences object written when creating a new store profile */
export const DEFAULT_USER_PREFERENCES = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  newsletter: false,
  smsNotifications: false,
  preferredCurrency: "USD",
  preferredLanguage: "en",
} as const;

/** Keys clients may PATCH via /api/user/settings */
export const SETTINGS_PATCH_ALLOWLIST = [
  "emailNotifications",
  "orderUpdates",
  "marketingEmails",
] as const;

export type SettingsPatchKey = (typeof SETTINGS_PATCH_ALLOWLIST)[number];

export function isSettingsPatchKey(key: string): key is SettingsPatchKey {
  return (SETTINGS_PATCH_ALLOWLIST as readonly string[]).includes(key);
}

export function normalizeNotificationPreferences(
  raw?: StoredUserPreferences | null,
): NotificationChannelPreference {
  const marketing =
    typeof raw?.marketingEmails === "boolean"
      ? raw.marketingEmails
      : typeof raw?.newsletter === "boolean"
        ? raw.newsletter
        : DEFAULT_NOTIFICATION_PREFERENCES.marketingEmails;

  return {
    emailNotifications:
      typeof raw?.emailNotifications === "boolean"
        ? raw.emailNotifications
        : DEFAULT_NOTIFICATION_PREFERENCES.emailNotifications,
    orderUpdates:
      typeof raw?.orderUpdates === "boolean"
        ? raw.orderUpdates
        : DEFAULT_NOTIFICATION_PREFERENCES.orderUpdates,
    marketingEmails: marketing,
  };
}

type InAppNotificationType =
  | "promo"
  | "order"
  | "system"
  | "marketing"
  | "general";

/**
 * Whether an in-app notification of this type should be delivered.
 * System messages always deliver (account/security-adjacent).
 */
export function shouldDeliverInAppNotification(
  preferences: StoredUserPreferences | null | undefined,
  type: InAppNotificationType,
): boolean {
  const prefs = normalizeNotificationPreferences(preferences);

  switch (type) {
    case "order":
      return prefs.orderUpdates;
    case "marketing":
    case "promo":
      return prefs.marketingEmails;
    case "system":
      return true;
    case "general":
    default:
      return prefs.emailNotifications || prefs.orderUpdates;
  }
}

export function shouldSendTransactionalEmail(
  preferences: StoredUserPreferences | null | undefined,
): boolean {
  return normalizeNotificationPreferences(preferences).emailNotifications;
}

export function shouldSendOrderUpdateEmail(
  preferences: StoredUserPreferences | null | undefined,
): boolean {
  return normalizeNotificationPreferences(preferences).orderUpdates;
}
