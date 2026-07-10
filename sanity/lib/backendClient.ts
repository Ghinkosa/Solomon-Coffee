import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

const resolveSanityToken = (
  primary: string | undefined,
  fallback?: string | undefined,
) => primary?.trim() || fallback?.trim() || undefined;

// Backend client with proper authentication for admin operations
export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Never use CDN for admin operations
  token: resolveSanityToken(
    process.env.SANITY_API_TOKEN,
    process.env.SANITY_API_READ_TOKEN,
  ),
  perspective: "published", // Use published perspective for admin operations
  ignoreBrowserTokenWarning: true, // Ignore token warning in server context
});
