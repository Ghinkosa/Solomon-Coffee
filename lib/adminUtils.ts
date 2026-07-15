/**
 * Server-only admin allowlist utilities.
 * Admin access is determined solely by ADMIN_EMAIL matching a Clerk account email.
 */

function splitAdminEmailEnv(raw: string): string[] {
  return raw
    .replace(/[\[\]]/g, "")
    .split(/[,;\n\r]+/)
    .map((email) => email.trim().replace(/^['"]+|['"]+$/g, "").trim())
    .filter((email) => email.length > 0 && email.includes("@"));
}

export const getAdminEmails = (): string[] => {
  // Prefer server-only ADMIN_EMAIL.
  // Also accept NEXT_PUBLIC_ADMIN_EMAIL on the server as a temporary migration
  // fallback if hosts still only have the public var set (do not add new ones).
  const adminEmailsEnv =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmailsEnv) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[admin] ADMIN_EMAIL is not set — every admin check will fail",
      );
    }
    return [];
  }

  if (
    !process.env.ADMIN_EMAIL &&
    process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
    process.env.NODE_ENV === "production"
  ) {
    console.warn(
      "[admin] Using NEXT_PUBLIC_ADMIN_EMAIL fallback. Move the list to server-only ADMIN_EMAIL",
    );
  }

  try {
    return splitAdminEmailEnv(adminEmailsEnv);
  } catch (error) {
    console.error("Error parsing admin emails:", error);
    return [];
  }
};

export const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  const normalized = userEmail
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .toLowerCase();
  if (!normalized) return false;

  const adminEmails = getAdminEmails().map((email) => email.toLowerCase());
  return adminEmails.includes(normalized);
};

/**
 * True if any of the provided emails is on the ADMIN_EMAIL allowlist.
 */
export const isAnyEmailAdmin = (
  emails: Array<string | null | undefined>,
): boolean => {
  return emails.some((email) => isUserAdmin(email));
};

/**
 * Admin check via email allowlist only (matches proxy / requireAdminUser).
 * Sanity `isAdmin` is ignored — put every staff email in ADMIN_EMAIL.
 */
export const isAdmin = (
  user: { email?: string | null; isAdmin?: boolean } | null | undefined,
): boolean => {
  if (!user?.email) return false;
  return isUserAdmin(user.email);
};

export const useIsAdmin = (userEmail: string | null | undefined): boolean => {
  return isUserAdmin(userEmail);
};
