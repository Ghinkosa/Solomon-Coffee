import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const blogType = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  icon: DocumentTextIcon,
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
      name: "mainImage",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "blogcategories",
      type: "array",
      of: [
        defineArrayMember({ type: "reference", to: { type: "blogcategory" } }),
      ],
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
    }),
    defineField({
      name: "isLatest",
      title: "Latest Blog",
      type: "boolean",
      description: "Toggle to Latest on or off",
      initialValue: true,
    }),
    defineField({
      name: "body",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      isLatest: "isLatest",
      publishedAt: "publishedAt",
    },
    prepare(selection) {
      const { isLatest, publishedAt } = selection;
      const bits = [
        isLatest ? "Latest" : null,
        publishedAt
          ? new Date(publishedAt).toLocaleDateString()
          : null,
      ].filter(Boolean);
      return {
        ...selection,
        subtitle: bits.length > 0 ? bits.join(" · ") : "Sheba Cup Coffee",
      };
    },
  },
});
