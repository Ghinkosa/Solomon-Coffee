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
      name: "coffeeDetails",
      title: "Coffee Details",
      type: "object",
      description: "Specialty coffee attributes shown on product pages.",
      fields: [
        defineField({
          name: "originCountry",
          title: "Origin Country",
          type: "string",
        }),
        defineField({
          name: "originRegion",
          title: "Origin Region",
          type: "string",
        }),
        defineField({
          name: "producer",
          title: "Farm / Producer",
          type: "string",
        }),
        defineField({
          name: "altitudeMeters",
          title: "Altitude (meters)",
          type: "number",
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: "processingMethod",
          title: "Processing Method",
          type: "string",
          options: {
            list: [
              { title: "Washed", value: "washed" },
              { title: "Natural", value: "natural" },
              { title: "Honey", value: "honey" },
              { title: "Anaerobic", value: "anaerobic" },
              { title: "Experimental", value: "experimental" },
            ],
          },
        }),
        defineField({
          name: "flavorNotes",
          title: "Flavor Notes",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.max(6),
        }),
        defineField({
          name: "recommendedBrewMethods",
          title: "Recommended Brew Methods",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Espresso", value: "espresso" },
              { title: "Pour Over", value: "pour-over" },
              { title: "French Press", value: "french-press" },
              { title: "Aeropress", value: "aeropress" },
              { title: "Cold Brew", value: "cold-brew" },
              { title: "Moka Pot", value: "moka-pot" },
            ],
          },
        }),
        defineField({
          name: "grindRecommendation",
          title: "Grind Recommendation",
          type: "string",
          options: {
            list: [
              { title: "Extra Fine", value: "extra-fine" },
              { title: "Fine", value: "fine" },
              { title: "Medium-Fine", value: "medium-fine" },
              { title: "Medium", value: "medium" },
              { title: "Coarse", value: "coarse" },
            ],
          },
        }),
        defineField({
          name: "brewRatio",
          title: "Suggested Brew Ratio",
          type: "string",
          description: "Example: 1:16 (coffee:water)",
        }),
        defineField({
          name: "roastDate",
          title: "Roast Date",
          type: "date",
        }),
        defineField({
          name: "harvestYear",
          title: "Harvest Year",
          type: "number",
          validation: (Rule) => Rule.min(2000).max(2100),
        }),
        defineField({
          name: "lotType",
          title: "Lot Type",
          type: "string",
          options: {
            list: [
              { title: "Core Blend", value: "core-blend" },
              { title: "Single Origin", value: "single-origin" },
              { title: "Micro-lot", value: "micro-lot" },
              { title: "Seasonal Release", value: "seasonal-release" },
            ],
          },
        }),
        defineField({
          name: "packageSizeGrams",
          title: "Package Size (g)",
          type: "number",
          validation: (Rule) => Rule.min(50),
        }),
        defineField({
          name: "beanFormat",
          title: "Bean Format",
          type: "string",
          options: {
            list: [
              { title: "Whole Bean", value: "whole-bean" },
              { title: "Ground", value: "ground" },
              { title: "Whole Bean & Ground", value: "both" },
            ],
          },
        }),
        defineField({
          name: "caffeineLevel",
          title: "Caffeine",
          type: "string",
          options: {
            list: [
              { title: "Caffeinated", value: "caffeinated" },
              { title: "Half-Caff", value: "half-caff" },
              { title: "Decaf", value: "decaf" },
            ],
          },
        }),
      ],
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
