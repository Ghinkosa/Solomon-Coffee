import { defineField, defineType } from "sanity";
import { Store } from "lucide-react";

export const wholesaleInquiryType = defineType({
  name: "wholesaleInquiry",
  title: "Wholesale Inquiries",
  type: "document",
  icon: Store,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "businessName",
      title: "Business Name",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "businessType",
      title: "Business Type",
      type: "string",
    }),
    defineField({
      name: "estimatedOrderQuantity",
      title: "Estimated Order Quantity",
      type: "string",
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Contacted", value: "contacted" },
          { title: "Qualified", value: "qualified" },
          { title: "Closed", value: "closed" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "ipAddress",
      title: "IP Address",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "userAgent",
      title: "User Agent",
      type: "text",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ title, subtitle, status, submittedAt }) {
      const date = submittedAt
        ? new Date(submittedAt).toLocaleDateString()
        : "";
      return {
        title: `${title} (${status?.toUpperCase() ?? "NEW"})`,
        subtitle: `${subtitle}${date ? ` • ${date}` : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Newest First",
      name: "newestFirst",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
