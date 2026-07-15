import AdminBanners from "@/components/admin/AdminBanners";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banners - Admin Panel",
  description: "Manage homepage carousel banners",
};

export default function BannersAdminPage() {
  return <AdminBanners />;
}
