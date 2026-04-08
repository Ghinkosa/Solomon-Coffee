import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

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
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "it", title: "Italian", type: "string" },
        { name: "fr", title: "French", type: "string" },
        { name: "hi", title: "Hindi", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
        { name: "am", title: "Amharic", type: "string" },
      ],
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "object",
      fields: [
        { name: "en", title: "English", type: "text" },
        { name: "it", title: "Italian", type: "text" },
        { name: "fr", title: "French", type: "text" },
        { name: "hi", title: "Hindi", type: "text" },
        { name: "ar", title: "Arabic", type: "text" },
        { name: "am", title: "Amharic", type: "string" },
      ],
    }),
    defineField({
      name: "badge",
      title: "Discount Badge",
      type: "object",
      description: "Discount Badge Ratio",
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "it", title: "Italian", type: "string" },
        { name: "fr", title: "French", type: "string" },
        { name: "hi", title: "Hindi", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
        { name: "am", title: "Amharic", type: "string" },

      ],
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
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "it", title: "Italian", type: "string" },
        { name: "fr", title: "French", type: "string" },
        { name: "hi", title: "Hindi", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
        { name: "am", title: "Amharic", type: "string" },

      ],
    }),
    defineField({
      name: "priceTitle",
      title: "Price Title",
      type: "object",
      description: "Text before price (e.g., Starting at)",
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "it", title: "Italian", type: "string" },
        { name: "fr", title: "French", type: "string" },
        { name: "hi", title: "Hindi", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
        { name: "am", title: "Amharic", type: "string" },

      ],
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
      options: {
        hotspot: true,
      },
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
        { name: "it", title: "Italian", type: "string" },
        { name: "fr", title: "French", type: "string" },
        { name: "hi", title: "Hindi", type: "string" },
        { name: "ar", title: "Arabic", type: "string" },
        { name: "am", title: "Amharic", type: "string" },

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
