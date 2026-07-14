import AdminContact from "@/components/admin/AdminContact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Messages - Admin Panel",
  description: "Manage contact form messages",
};

export default function ContactAdminPage() {
  return <AdminContact />;
}
