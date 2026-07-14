import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { currentUser } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const user = await currentUser();

  const isAdmin = isUserAdmin(
    user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress,
  );

  const serializedUser = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddresses: user.emailAddresses.map((email: { emailAddress: string }) => ({
          emailAddress: email.emailAddress,
        })),
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : null,
      }
    : null;

  return (
    <AdminAuthGuard isAdmin={isAdmin}>
      <AdminShell user={serializedUser}>{children}</AdminShell>
    </AdminAuthGuard>
  );
};

export default AdminLayout;
