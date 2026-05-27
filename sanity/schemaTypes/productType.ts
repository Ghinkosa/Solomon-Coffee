import { TrolleyIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import React from "react";

// Custom preview component for product
const ProductPreview = (props: any) => {
  const { title, media, price, stock, weightOptions } = props;
  
  // Find the default weight option
  const defaultWeight = weightOptions?.find((opt: any) => opt.isDefault);
  const displayPrice = defaultWeight ? defaultWeight.price : price;
  
  // Determine stock status
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
  
  // Show weight info if default weight exists
  const weightInfo = defaultWeight ? ` (Default: ${defaultWeight.weight})` : "";
  
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 0'
    }
  }, [
    media ? React.createElement('div', { key: 'media', style: { width: '40px', height: '40px', overflow: 'hidden', borderRadius: '4px' } }, media) : null,
    React.createElement('div', { key: 'content', style: { flex: 1 } }, [
      React.createElement('div', { key: 'title', style: { fontWeight: 'bold' } }, title),
      React.createElement('div', { key: 'subtitle', style: { fontSize: '12px', color: '#666' } }, 
        `$${displayPrice}${weightInfo} • ${stockColor} ${stockStatus}`
      )
    ])
  ]);
};

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
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 1", value: "h1" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    title: "URL",
                    type: "url",
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "price",
      title: "Base Price",
      type: "number",
      description: "Base price if no weight variations",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      validation: (Rule) => Rule.min(0),
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
    
    // Weight Options
    defineField({
      name: "weightOptions",
      title: "Weight Options",
      type: "array",
      description: "Add different weight/package sizes with their prices",
      of: [
        defineField({
          name: "weightOption",
          title: "Weight Option",
          type: "object",
          fields: [
            defineField({
              name: "weight",
              title: "Weight",
              type: "string",
              options: {
                list: [
                  { title: "125G", value: "125G" },
                  { title: "250G", value: "250G" },
                  { title: "500G", value: "500G" },
                  { title: "1KG", value: "1KG" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: "isDefault",
              title: "Set as Default",
              type: "boolean",
              description: "This weight will be selected by default",
              initialValue: false,
            }),
            defineField({
              name: "stock",
              title: "Stock for this weight",
              type: "number",
              validation: (Rule) => Rule.min(0),
              initialValue: 0,
            }),
          ],
          preview: {
            select: {
              title: "weight",
              subtitle: "price",
              isDefault: "isDefault",
            },
            prepare(selection) {
              const { title, subtitle, isDefault } = selection;
              return {
                title: `${title} - $${subtitle}`,
                subtitle: isDefault ? "✓ DEFAULT OPTION" : "",
              };
            },
          },
        }),
      ],
    }),

    // Grind Options
    defineField({
      name: "grindOptions",
      title: "Grind Options",
      type: "array",
      description: "Select available grind types for this product",
      of: [
        defineField({
          name: "grindOption",
          title: "Grind Option",
          type: "object",
          fields: [
            defineField({
              name: "grindType",
              title: "Grind Type",
              type: "string",
              options: {
                list: [
                  { title: "Whole Bean", value: "whole-bean" },
                  { title: "Cafetiere", value: "cafetiere" },
                  { title: "Filter", value: "filter" },
                  { title: "Espresso", value: "espresso" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "isDefault",
              title: "Set as Default",
              type: "boolean",
              description: "This grind will be selected by default",
              initialValue: false,
            }),
            defineField({
              name: "available",
              title: "Available",
              type: "boolean",
              description: "Is this grind option available?",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "grindType",
              isDefault: "isDefault",
              available: "available",
            },
            prepare(selection) {
              const { title, isDefault, available } = selection;
              const titleDisplay = title?.replace("-", " ").toUpperCase();
              return {
                title: titleDisplay,
                subtitle: !available 
                  ? "❌ UNAVAILABLE" 
                  : isDefault 
                    ? "✓ DEFAULT OPTION" 
                    : "",
              };
            },
          },
        }),
      ],
    }),

    // Packaging Options (Reference to packaging document)
    defineField({
      name: "packagingOptions",
      title: "Packaging Options",
      type: "array",
      description: "Select available packaging options for this product",
      of: [
        defineField({
          name: "packagingOption",
          title: "Packaging Option",
          type: "object",
          fields: [
            defineField({
              name: "packaging",
              title: "Packaging Type",
              type: "reference",
              to: [{ type: "packaging" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "isDefault",
              title: "Set as Default",
              type: "boolean",
              description: "This packaging will be selected by default for this product",
              initialValue: false,
            }),
            defineField({
              name: "available",
              title: "Available",
              type: "boolean",
              description: "Is this packaging option available for this product?",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "packaging.title",
              subtitle: "packaging.price",
              isDefault: "isDefault",
              available: "available",
              media: "packaging.image",
            },
            prepare(selection) {
              const { title, subtitle, isDefault, available, media } = selection;
              return {
                title: title || "Unknown Packaging",
                subtitle: !available 
                  ? "❌ UNAVAILABLE" 
                  : isDefault 
                    ? `✓ DEFAULT (${subtitle === 0 ? "Free" : `+$${subtitle}`})` 
                    : subtitle === 0 ? "Free" : `+$${subtitle}`,
                media: media,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "coffeeDetails",
      title: "Coffee Details",
      type: "object",
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
      initialValue: false,
    }),
    defineField({
      name: "averageRating",
      title: "Average Rating",
      type: "number",
      readOnly: true,
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: "totalReviews",
      title: "Total Reviews",
      type: "number",
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: "ratingDistribution",
      title: "Rating Distribution",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "fiveStars", title: "5 Stars", type: "number", initialValue: 0 }),
        defineField({ name: "fourStars", title: "4 Stars", type: "number", initialValue: 0 }),
        defineField({ name: "threeStars", title: "3 Stars", type: "number", initialValue: 0 }),
        defineField({ name: "twoStars", title: "2 Stars", type: "number", initialValue: 0 }),
        defineField({ name: "oneStar", title: "1 Star", type: "number", initialValue: 0 }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      price: "price",
      stock: "stock",
      weightOptions: "weightOptions",
    },
    prepare(selection) {
      const { title, price, stock, media, weightOptions } = selection;
      const image = media && media[0];
      
      // Find the default weight option - this changes the display price
      const defaultWeight = weightOptions?.find((opt: any) => opt.isDefault);
      const displayPrice = defaultWeight ? defaultWeight.price : price;
      
      // Show weight info if default weight exists
      const weightInfo = defaultWeight ? ` (Default: ${defaultWeight.weight})` : "";

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
        subtitle: `$${displayPrice}${weightInfo} • ${stockColor} ${stockStatus}`,
        media: image,
      };
    },
  },
});