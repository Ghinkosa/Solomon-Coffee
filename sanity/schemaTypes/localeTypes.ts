import { defineField, defineType } from "sanity";

/**
 * Reusable locale object types (en / es / ar).
 * Industry-standard pattern for Sanity multi-language field values.
 */
export const localeStringType = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "es", title: "Spanish", type: "string" }),
    defineField({ name: "ar", title: "Arabic", type: "string" }),
  ],
});

export const localeTextType = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "es",
      title: "Spanish",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "text",
      rows: 4,
    }),
  ],
});
