import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const packaging = defineType({
  name: "packaging",
  title: "packaging",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "price",
      type: "number",
      description: "set price",
    }),
    defineField({
      name: "default",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
});
