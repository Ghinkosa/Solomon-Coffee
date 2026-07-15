// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from "./client";

/** Server can fall back to write token for SSR fetches if needed. */
const serverToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

/**
 * Browser token must be Viewer/read-only. Never fall back to SANITY_API_TOKEN
 * (write) — that would ship editor credentials to the client.
 */
const browserToken = process.env.SANITY_API_READ_TOKEN;

if (!serverToken) {
  console.error(
    "Available env vars:",
    Object.keys(process.env).filter((key) => key.includes("SANITY")),
  );
  throw new Error(
    "Missing SANITY_API_READ_TOKEN (or SANITY_API_TOKEN). Please check your .env file.",
  );
}

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  // Omit browser live token unless a dedicated read token exists
  ...(browserToken ? { browserToken } : {}),
  fetchOptions: {
    revalidate: 0,
  },
});
