type PortableTextSpan = {
  _type?: string;
  text?: string;
};

type PortableTextBlock = {
  _type?: string;
  children?: PortableTextSpan[];
};

/** Normalize Sanity string or portable-text blocks to plain text for UI. */
export function toPlainText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((item) => toPlainText(item))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (typeof value === "object") {
    const block = value as PortableTextBlock;
    if (Array.isArray(block.children)) {
      return block.children
        .map((child) => (typeof child.text === "string" ? child.text : ""))
        .join("")
        .trim();
    }
  }

  return "";
}
