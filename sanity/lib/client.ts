import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

const resolveSanityToken = (
  primary: string | undefined,
  fallback?: string | undefined,
) => primary?.trim() || fallback?.trim() || undefined;

// Read-only client for fetching data (uses CDN for better performance)
// Stega is disabled on the storefront client — encoded/edit overlays can
// interfere with locale objects ({ en, ar }) used as product names.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: false,
});

// Authenticated read client for server-side queries that need a token
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: resolveSanityToken(
    process.env.SANITY_API_READ_TOKEN,
    process.env.SANITY_API_TOKEN,
  ),
  ignoreBrowserTokenWarning: true,
});

// Write client for mutations (authenticated) - Use this for create, update, delete operations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN for write operations
  token: resolveSanityToken(process.env.SANITY_API_TOKEN),
  ignoreBrowserTokenWarning: true,
});

export function getSanityAuthErrorMessage(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : undefined;

  if (
    statusCode === 401 ||
    message.includes("Session not found") ||
    message.includes("Unauthorized")
  ) {
    return process.env.NODE_ENV === "development"
      ? "Sanity write access failed. Regenerate an Editor API token at sanity.io/manage and update SANITY_API_TOKEN in .env, then restart the dev server."
      : "Order storage is temporarily unavailable. Please try again later.";
  }

  return null;
}
