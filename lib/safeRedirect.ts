/**
 * Allow only same-origin relative paths (blocks open redirects).
 */
export function safeRelativeRedirect(
  redirectTo: string | null | undefined,
  fallback: string,
): string {
  if (!redirectTo) return fallback;

  let decoded = redirectTo;
  try {
    decoded = decodeURIComponent(redirectTo);
  } catch {
    return fallback;
  }

  const trimmed = decoded.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }
  // Reject control chars / newlines used in header injection tricks
  if (/[\0-\x1f\x7f]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Admin login may only bounce into /admin (locale-prefixed or not).
 */
export function safeAdminRedirect(
  redirectTo: string | undefined,
  lang: string,
): string {
  const fallback = `/${lang}/admin`;
  const safe = safeRelativeRedirect(redirectTo, fallback);
  if (safe === fallback && !redirectTo) return fallback;

  const normalized = safe.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  if (!normalized.startsWith("/admin")) return fallback;
  if (
    normalized.startsWith("/admin/login") ||
    normalized.startsWith("/admin/access-denied")
  ) {
    return fallback;
  }

  return normalized === safe ? `/${lang}${normalized}` : safe;
}
