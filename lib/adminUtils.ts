// Admin utility functions
export const getAdminEmails = (): string[] => {
  // Server-only — never use NEXT_PUBLIC_ADMIN_EMAIL (leaks in the client bundle).
  const adminEmailsEnv = process.env.ADMIN_EMAIL;
  if (!adminEmailsEnv) return [];

  try {
    // Handle array format: [email1,email2] or just comma-separated: email1,email2
    // Also strip wrapping quotes that often sneak into .env values.
    const cleanEmails = adminEmailsEnv
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((email) => email.trim().replace(/^['"]+|['"]+$/g, "").trim())
      .filter((email) => email.length > 0);

    return cleanEmails;
  } catch (error) {
    console.error("Error parsing admin emails:", error);
    return [];
  }
};

export const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  const normalized = userEmail.trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
  if (!normalized) return false;

  const adminEmails = getAdminEmails().map((email) => email.toLowerCase());
  return adminEmails.includes(normalized);
};

/**
 * Admin check via ADMIN_EMAIL allowlist only (matches proxy / requireAdminUser).
 * Sanity `isAdmin` is ignored — set ADMIN_EMAIL for all staff who need ops access.
 */
export const isAdmin = (
  user: { email?: string | null; isAdmin?: boolean } | null | undefined
): boolean => {
  if (!user?.email) return false;
  return isUserAdmin(user.email);

  return false;
};

export const useIsAdmin = (userEmail: string | null | undefined): boolean => {
  return isUserAdmin(userEmail);
};
