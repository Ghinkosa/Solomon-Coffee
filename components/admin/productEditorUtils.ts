/** Client-safe helpers shared by the product editor UI. */

export function makeKey(prefix = "k") {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
