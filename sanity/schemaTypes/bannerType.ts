import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const MAX_VIDEO_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_DURATION_SECONDS = 15;

const localeStringFields = [
  { name: "en", title: "English", type: "string" as const },
  { name: "es", title: "Spanish", type: "string" as const },
  { name: "ar", title: "Arabic", type: "string" as const },
];

const localeTextFields = [
  { name: "en", title: "English", type: "text" as const },
  { name: "es", title: "Spanish", type: "text" as const },
  { name: "ar", title: "Arabic", type: "text" as const },
];

export const bannerType = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Sale Title",
      type: "object",
      fields: localeStringFields,
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "object",
      fields: localeTextFields,
    }),
    defineField({
      name: "badge",
      title: "Discount Badge",
      type: "object",
      description: "Discount Badge Ratio",
      fields: localeStringFields,
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Amount",
      type: "number",
      description: "Amount off in percentage or fixed value",
    }),
    defineField({
      name: "subtitle",
      title: "Sub Title",
      type: "object",
      fields: localeStringFields,
    }),
    defineField({
      name: "priceTitle",
      title: "Price Title",
      type: "object",
      description: "Text before price (e.g., Starting at)",
      fields: localeStringFields,
    }),
    defineField({
      name: "price",
      title: "Starting Price",
      type: "number",
    }),
    defineField({
      name: "image",
      title: "Banner Image",
      type: "image",
      description: "Fallback background image and poster for slower connections.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "backgroundVideo",
      title: "Background Video",
      type: "file",
      description:
        "Optional hero background video. Keep it short (6-12s), muted, and compressed for fast loading.",
      options: {
        accept: "video/mp4,video/webm",
      },
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (!value || typeof value !== "object" || !("asset" in value))
            return true;

          const assetRef = (value as { asset?: { _ref?: string } }).asset?._ref;
          if (!assetRef) return true;

          const client = context.getClient({ apiVersion: "2026-03-22" });
          const asset = await client.fetch(
            `*[_id == $id][0]{
              size,
              mimeType,
              "duration": metadata.duration
            }`,
            { id: assetRef },
          );

          if (!asset) return "Unable to validate video asset. Please re-upload.";
          if (!asset.mimeType?.startsWith("video/"))
            return "Only video files are allowed for Background Video.";
          if (asset.size && asset.size > MAX_VIDEO_BYTES)
            return "Video must be 8MB or smaller for fast loading.";
          if (
            typeof asset.duration === "number" &&
            asset.duration > MAX_VIDEO_DURATION_SECONDS
          )
            return "Video must be 15 seconds or shorter.";

          return true;
        }),
    }),
    defineField({
      name: "disableVideoOnMobile",
      title: "Disable Video On Mobile",
      type: "boolean",
      description:
        "Recommended for performance. Uses the banner image for mobile devices.",
      initialValue: true,
    }),
    defineField({
      name: "weight",
      title: "Banner Order Weight",
      type: "number",
      description:
        "Used to order banners. Lower numbers appear first (e.g., 1, 2, 3).",
      initialValue: 100,
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "object",
      fields: [
        {
          name: "en",
          title: "English",
          type: "string",
          initialValue: "Shop Now",
        },
        { name: "es", title: "Spanish", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
      ],
    }),
    defineField({
      name: "link",
      title: "Banner Link",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https", "mailto", "tel"],
          allowRelative: true,
        }),
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      discountAmount: "discountAmount",
      price: "price",
    },
    prepare(select) {
      const { title, discountAmount, price } = select;

      return {
        title: title || "No Title",
        subtitle: `${discountAmount ? `${discountAmount}% off` : "No discount"} - Starting at $${price || 0}`,
      };
    },
  },
});
