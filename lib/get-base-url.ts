/**
 * Resolve the public base URL for redirects (Stripe success/cancel, emails, etc.).
 * Fails in production if unset; falls back to localhost in development.
 */
export function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL is not set. Configure it in your hosting environment.",
    );
  }

  return raw;
}
