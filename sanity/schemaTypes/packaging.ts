// sanity/schemaTypes/packaging.ts
import { defineType, defineField } from "sanity";
import { PackageIcon } from "@sanity/icons";

export const packagingType = defineType({
  name: "packaging",
  title: "Packaging Options",
  type: "document",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "price",
      title: "Additional Price",
      type: "number",
      description: "Additional cost for this packaging",
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: "default",
      title: "Default Packaging",
      type: "boolean",
      description: "Set as default packaging option across the store (fallback)",
      initialValue: false,
    }),
    defineField({
      name: "image",
      title: "Packaging Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "price",
      media: "image",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title,
        subtitle: subtitle ? `+$${subtitle}` : "Free",
        media: media,
      };
    },
  },
});