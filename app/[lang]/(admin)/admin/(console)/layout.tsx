import React from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { auth } from "@clerk/nextjs/server";
import { resolveAdminAccess } from "@/lib/adminGate";

interface AdminConsoleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

const AdminConsoleLayout = async ({
  children,
  params,
}: AdminConsoleLayoutProps) => {
  const { lang } = await params;
  const { userId } = await auth();
  const gate = await resolveAdminAccess(userId);

  if (gate.status === "unauthenticated") {
    redirect(
      `/${lang}/admin/login?redirectTo=${encodeURIComponent(`/${lang}/admin`)}`,
    );
  }

  if (gate.status === "unavailable") {
    // Prefer retry over a false "access denied" while Clerk is unreachable.
    console.error("[admin] Clerk unavailable in console layout:", gate.reason);
    redirect(
      `/${lang}/admin/login?redirectTo=${encodeURIComponent(`/${lang}/admin`)}&error=auth_unavailable`,
    );
  }

  if (gate.status === "denied") {
    redirect(`/${lang}/admin/access-denied`);
  }

  const user = gate.user;
  const serializedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    emailAddresses: user.emailAddresses.map((email) => ({
      emailAddress: email.emailAddress,
    })),
    primaryEmailAddress: user.primaryEmailAddress
      ? { emailAddress: user.primaryEmailAddress.emailAddress }
      : null,
  };

  return (
    <AdminAuthGuard isAdmin={true}>
      <AdminShell user={serializedUser}>{children}</AdminShell>
    </AdminAuthGuard>
  );
};

export default AdminConsoleLayout;
