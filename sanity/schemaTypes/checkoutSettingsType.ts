import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export const checkoutSettingsType = defineType({
  name: "checkoutSettings",
  title: "Checkout Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "flatShippingFee",
      title: "Flat Shipping Fee",
      type: "number",
      description: "Shipping charged when the order is below the free-shipping threshold.",
      initialValue: 10,
      validation: (Rule) => Rule.required().min(0).max(1000),
    }),
    defineField({
      name: "freeShippingThreshold",
      title: "Free Shipping Threshold",
      type: "number",
      description: "Orders at or above this merchandise amount receive free shipping.",
      initialValue: 100,
      validation: (Rule) => Rule.required().min(0).max(100000),
    }),
    defineField({
      name: "businessDiscountPercent",
      title: "Business Account Discount (%)",
      type: "number",
      description:
        "Percent discount for approved business accounts. Does not stack with premium.",
      initialValue: 2,
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "premiumDiscountPercent",
      title: "Premium Member Discount (%)",
      type: "number",
      description:
        "Percent discount for approved premium members. Does not stack with business.",
      initialValue: 5,
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: "taxEnabled",
      title: "Enable Sales Tax",
      type: "boolean",
      description:
        "When enabled, checkout applies the rate for the customer's shipping state.",
      initialValue: false,
    }),
    defineField({
      name: "taxRatesReviewedAt",
      title: "Tax Rates Last Reviewed",
      type: "datetime",
      description:
        "Updated automatically whenever checkout tax settings are saved from the admin panel.",
      readOnly: true,
    }),
    defineField({
      name: "stateTaxRates",
      title: "US State Tax Rates",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "stateTaxRate",
          fields: [
            defineField({
              name: "stateCode",
              title: "State Code",
              type: "string",
              description: "Two-letter US state code (e.g. TX, CA)",
              validation: (Rule) =>
                Rule.required().length(2).uppercase().error("Use a 2-letter state code"),
            }),
            defineField({
              name: "rate",
              title: "Tax Rate (decimal)",
              type: "number",
              description: "Decimal rate, e.g. 0.0625 for 6.25%",
              validation: (Rule) => Rule.required().min(0).max(1),
              initialValue: 0,
            }),
            defineField({
              name: "taxShipping",
              title: "Tax Shipping",
              type: "boolean",
              description:
                "When enabled, shipping is included in the taxable base for this state.",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              stateCode: "stateCode",
              rate: "rate",
              taxShipping: "taxShipping",
            },
            prepare({ stateCode, rate, taxShipping }) {
              const percent =
                typeof rate === "number"
                  ? `${(rate * 100).toFixed(3).replace(/\.?0+$/, "")}%`
                  : "0%";
              return {
                title: stateCode || "State",
                subtitle: `${percent}${taxShipping ? " · shipping taxable" : " · shipping excluded"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Checkout Settings",
        subtitle: "US state sales tax configuration",
      };
    },
  },
});
