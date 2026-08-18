import crypto from "crypto";
import { backendClient } from "@/sanity/lib/backendClient";

type RateLimitEntry = {
  _id?: string;
  _rev?: string;
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Shared rate limiter for public endpoints.
 * Uses Sanity as the distributed backend when write access is available, and
 * falls back to a per-instance memory bucket only if the backend is unavailable.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!process.env.SANITY_API_TOKEN?.trim()) {
    return checkInMemoryRateLimit(key, limit, windowMs);
  }

  try {
    return await checkDistributedRateLimit(key, limit, windowMs);
  } catch (error) {
    console.error("Distributed rate limit fallback:", error);
    return checkInMemoryRateLimit(key, limit, windowMs);
  }
}

function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

async function checkDistributedRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucketId = getBucketId(key);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const existing = await backendClient.fetch<RateLimitEntry | null>(
      `*[_type == "rateLimitBucket" && _id == $bucketId][0]{
        _id,
        _rev,
        count,
        resetAt
      }`,
      { bucketId },
    );

    if (!existing) {
      try {
        await backendClient.create({
          _id: bucketId,
          _type: "rateLimitBucket",
          keyHash: bucketId,
          count: 1,
          resetAt: now + windowMs,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        });
        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        };
      } catch {
        continue;
      }
    }

    if (existing.resetAt <= now) {
      try {
        await backendClient
          .patch(bucketId)
          .ifRevisionId(existing._rev || "")
          .set({
            count: 1,
            resetAt: now + windowMs,
            updatedAt: new Date(now).toISOString(),
          })
          .commit();
        return {
          allowed: true,
          remaining: Math.max(0, limit - 1),
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        };
      } catch {
        continue;
      }
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.resetAt - now) / 1000),
        ),
      };
    }

    try {
      await backendClient
        .patch(bucketId)
        .ifRevisionId(existing._rev || "")
        .inc({ count: 1 })
        .set({ updatedAt: new Date(now).toISOString() })
        .commit();
      const nextCount = existing.count + 1;
      return {
        allowed: true,
        remaining: Math.max(0, limit - nextCount),
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.resetAt - now) / 1000),
        ),
      };
    } catch {
      continue;
    }
  }

  throw new Error(`Failed to claim distributed rate limit bucket for ${key}`);
}

function getBucketId(key: string): string {
  const digest = crypto.createHash("sha256").update(key).digest("hex");
  return `rateLimitBucket.${digest}`;
}

export function getClientIp(request: {
  headers: { get(name: string): string | null };
}): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
