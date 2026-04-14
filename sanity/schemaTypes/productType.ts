import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: { type: "brand" },
    }),

    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "variant",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Light Roast", value: "Light Roast" },
          { title: "Medium Roast", value: "Medium Roast" },
          { title: "Dark Roast", value: "Dark Roast" },
          { title: "Extra Dark", value: "Extra Dark" },
        ],
      },
    }),
    
    defineField({
      name: "isFeatured",
      title: "Featured Product",
      type: "boolean",
      description: "Toggle to Featured on or off",
      initialValue: false,
    }),
    defineField({
      name: "averageRating",
      title: "Average Rating",
      type: "number",
      readOnly: true,
      description: "Calculated average rating from approved reviews",
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "totalReviews",
      title: "Total Reviews",
      type: "number",
      readOnly: true,
      initialValue: 0,
      description: "Total number of approved reviews",
    }),
    defineField({
      name: "ratingDistribution",
      title: "Rating Distribution",
      type: "object",
      readOnly: true,
      description: "Distribution of ratings (1-5 stars)",
      fields: [
        defineField({
          name: "fiveStars",
          title: "5 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "fourStars",
          title: "4 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "threeStars",
          title: "3 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "twoStars",
          title: "2 Stars",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "oneStar",
          title: "1 Star",
          type: "number",
          initialValue: 0,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      price: "price",
      stock: "stock",
    },
    prepare(selection) {
      const { title, price, stock, media } = selection;
      const image = media && media[0];

      // Determine stock status and styling
      let stockStatus = "";
      let stockColor = "";

      if (stock === 0 || stock === null || stock === undefined) {
        stockStatus = "OUT OF STOCK";
        stockColor = "🔴";
      } else if (stock <= 5) {
        stockStatus = `LOW STOCK (${stock})`;
        stockColor = "🟠";
      } else {
        stockStatus = `In Stock: ${stock}`;
        stockColor = "🟢";
      }

      return {
        title: title,
        subtitle: `$${price} • ${stockColor} ${stockStatus}`,
        media: image,
      };
    },
  },
});
