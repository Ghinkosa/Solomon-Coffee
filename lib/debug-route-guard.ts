import { NextResponse } from "next/server";

/**
 * Debug API routes must never be reachable in production builds.
 * Returns a 404 response when blocked, or null when the route may proceed.
 */
export function blockDebugInProduction(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}
