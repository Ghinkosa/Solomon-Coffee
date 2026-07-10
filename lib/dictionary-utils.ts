import type { Dictionary } from "@/lib/dictionary-context";

/** Safe accessor for nested dictionary paths with fallback */
export function t(
  dictionary: Dictionary | null | undefined,
  path: string,
  fallback = "",
): string {
  if (!dictionary) return fallback;
  const value = path.split(".").reduce<unknown>((obj, key) => {
    if (obj && typeof obj === "object" && key in (obj as object)) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, dictionary);
  return typeof value === "string" ? value : fallback;
}
