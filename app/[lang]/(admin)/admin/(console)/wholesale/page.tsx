import AdminWholesale from "@/components/admin/AdminWholesale";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wholesale Inquiries - Admin Panel",
  description: "Manage wholesale and retailer inquiries",
};

export default function WholesaleAdminPage() {
  return <AdminWholesale />;
}
