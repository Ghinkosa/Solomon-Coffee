import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,

  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "invoice",
      title: "Invoice",
      type: "object",
      fields: [
        defineField({
          name: "id",
          title: "Invoice ID",
          type: "string",
        }),
        defineField({
          name: "number",
          title: "Invoice Number",
          type: "string",
        }),
        defineField({
          name: "hosted_invoice_url",
          title: "Hosted Invoice URL",
          type: "url",
        }),
      ],
    }),

    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
      hidden: ({ document }) =>
        document?.paymentMethod !== "stripe",
    }),

    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      hidden: ({ document }) =>
        document?.paymentMethod !== "stripe",
    }),

    defineField({
      name: "isGuest",
      title: "Guest Order",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "locale",
      title: "Customer Locale",
      type: "string",
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: "clerkUserId",
      title: "Store User ID",
      type: "string",
      hidden: ({ document }) => document?.isGuest === true,
    }),

    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),

    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      hidden: ({ document }) =>
        document?.paymentMethod !== "stripe",
    }),

    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: "stripeCheckoutExpiresAt",
      title: "Stripe Checkout Expires At",
      type: "datetime",
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: "stripeCheckoutExpiredAt",
      title: "Stripe Checkout Expired At",
      type: "datetime",
      readOnly: true,
      hidden: true,
    }),

    // Internal webhook bookkeeping — ensures payment side effects run exactly
    // once even across Stripe webhook retries. Not meant for manual editing.
    defineField({
      name: "stockDecremented",
      title: "Stock Decremented",
      type: "boolean",
      readOnly: true,
      initialValue: false,
      hidden: true,
    }),

    defineField({
      name: "fulfillmentProcessed",
      title: "Fulfillment Processed",
      type: "boolean",
      readOnly: true,
      initialValue: false,
      hidden: true,
    }),

    defineField({
      name: "stockRestored",
      title: "Stock Restored",
      type: "boolean",
      readOnly: true,
      initialValue: false,
      hidden: true,
    }),

    defineField({
      name: "pointsAwarded",
      title: "Loyalty Points Awarded",
      type: "boolean",
      readOnly: true,
      initialValue: false,
      hidden: true,
    }),

    defineField({
      name: "amountPaid",
      title: "Amount Paid",
      type: "number",
      readOnly: true,
      hidden: ({ document }) => document?.paymentMethod !== "stripe",
    }),

    defineField({
      name: "paymentCompletedAt",
      title: "Payment Completed At",
      type: "datetime",
      readOnly: true,
      hidden: ({ document }) => document?.paymentMethod !== "stripe",
    }),

    // PRODUCTS with Weight, Grind, and Packaging support
    defineField({
      name: "products",
      title: "Products",
      type: "array",

      of: [
        defineArrayMember({
          type: "object",

          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            }),

            // ✅ ADD WEIGHT FIELD
            defineField({
              name: "weight",
              title: "Selected Weight",
              type: "object",
              fields: [
                defineField({
                  name: "value",
                  title: "Weight Value",
                  type: "string",
                }),
                defineField({
                  name: "price",
                  title: "Weight Price",
                  type: "number",
                }),
              ],
            }),

            // ✅ ADD GRIND FIELD
            defineField({
              name: "grind",
              title: "Selected Grind",
              type: "object",
              fields: [
                defineField({
                  name: "type",
                  title: "Grind Type",
                  type: "string",
                }),
                defineField({
                  name: "label",
                  title: "Grind Label",
                  type: "string",
                }),
              ],
            }),

            // ✅ ADD PACKAGING FIELD
            defineField({
              name: "packaging",
              title: "Selected Packaging",
              type: "object",
              fields: [
                defineField({
                  name: "id",
                  title: "Packaging ID",
                  type: "string",
                }),
                defineField({
                  name: "title",
                  title: "Packaging Title",
                  type: "string",
                }),
                defineField({
                  name: "price",
                  title: "Packaging Price",
                  type: "number",
                }),
              ],
            }),
          ],

          preview: {
            select: {
              product: "product.name",
              quantity: "quantity",
              image: "product.images.0",
              price: "product.price",
              weight: "weight.value",
              grind: "grind.label",
              packaging: "packaging.title",
            },
            prepare(selection) {
              const {
                product,
                quantity,
                image,
                price,
                weight,
                grind,
                packaging,
              } = selection;

              let subtitle = `Qty: ${quantity || 0} | $${price || 0}`;
              if (weight) subtitle += ` | Weight: ${weight}`;
              if (grind) subtitle += ` | Grind: ${grind}`;
              if (packaging) subtitle += ` | Packaging: ${packaging}`;

              return {
                title: `${product || "Unknown Product"}`,
                subtitle: subtitle,
                media: image,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "subtotal",
      title: "Subtotal",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "tax",
      title: "Tax Amount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "shipping",
      title: "Shipping Cost",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "packagingFee",
      title: "Packaging Fee",
      type: "number",
      description: "Total additional cost for packaging",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "address",
      title: "Shipping Address",
      type: "object",

      fields: [
        defineField({
          name: "state",
          title: "State",
          type: "string",
        }),
        defineField({
          name: "zip",
          title: "Zip Code",
          type: "string",
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),
        defineField({
          name: "address",
          title: "Address",
          type: "string",
        }),
        defineField({
          name: "name",
          title: "Name",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "status",
      title: "Order Status",
      type: "string",

      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Address Confirmed", value: "address_confirmed" },
          { title: "Order Confirmed", value: "order_confirmed" },
          { title: "Packed", value: "packed" },
          { title: "Ready for Delivery", value: "ready_for_delivery" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Rescheduled", value: "rescheduled" },
          { title: "Failed Delivery", value: "failed_delivery" },
        ],
      },

      initialValue: "pending",
    }),

    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",

      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },

      initialValue: "pending",
    }),

    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",

      options: {
        list: [
          { title: "Cash on Delivery", value: "cash_on_delivery" },
          { title: "Stripe", value: "stripe" },
          { title: "Card", value: "card" },
        ],
      },
    }),

    // ✅ Add status history for tracking
    defineField({
      name: "statusHistory",
      title: "Status History",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "status", title: "Status", type: "string" }),
            defineField({ name: "changedBy", title: "Changed By", type: "string" }),
            defineField({ name: "changedAt", title: "Changed At", type: "datetime" }),
            defineField({ name: "notes", title: "Notes", type: "text" }),
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      status: "status",
      paymentStatus: "paymentStatus",
    },

    prepare(selection) {
      const {
        name,
        amount,
        currency,
        orderId,
        status,
        paymentStatus,
      } = selection;

      const orderIdSnippet = orderId
        ? `${orderId.slice(0, 5)}...${orderId.slice(-5)}`
        : "Unknown";

      const statusMap: Record<string, string> = {
        pending: "🔴 Pending",
        address_confirmed: "🟡 Address Confirmed",
        order_confirmed: "🟢 Order Confirmed",
        packed: "📦 Packed",
        ready_for_delivery: "🏭 Ready for Delivery",
        out_for_delivery: "🚚 Out for Delivery",
        delivered: "✅ Delivered",
        completed: "✔️ Completed",
        cancelled: "❌ Cancelled",
        rescheduled: "🔄 Rescheduled",
        failed_delivery: "⚠️ Failed Delivery",
      };

      const statusDisplay = statusMap[status] || status;
      const paymentDisplay = paymentStatus === "paid" ? "💳 Paid" : `💰 ${paymentStatus}`;

      return {
        title: `${name || "Unknown"} (${orderIdSnippet})`,
        subtitle: `${statusDisplay} | ${amount || 0} ${currency || "USD"} | ${paymentDisplay}`,
        media: BasketIcon,
      };
    },
  },
});