/**
 * Sanity user document helpers.
 *
 * The registered schema type is `user` (see sanity/schemaTypes/userType.ts).
 * Legacy code created ghost docs with `_type: "userType"` — reads check both
 * during the transition; all new writes use `_type: "user"`.
 */

/** GROQ filter: match user docs by email (legacy + current). */
export const USER_BY_EMAIL_FILTER =
  '_type in ["user", "userType"] && email == $email';

/** GROQ filter: match user docs by Sanity _id. */
export const USER_BY_ID_FILTER =
  '_type in ["user", "userType"] && _id == $id';

/** GROQ filter: match by Clerk id or email. */
export const USER_BY_CLERK_OR_EMAIL_FILTER =
  '_type in ["user", "userType"] && (clerkUserId == $clerkUserId || email == $email)';

export const SANITY_USER_TYPE = "user" as const;
