import { Metadata } from "next";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { resolveAdminAccess } from "@/lib/adminGate";
import { i18n } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Sheba Content",
  description: "Catalog and content tools for Sheba Cup Coffee.",
};

/**
 * Layout re-check: fail closed if Clerk is unavailable or user is not admin.
 * Complements proxy.ts so Studio never relies on middleware alone.
 */
const RootLayout = async ({ children }: { children: ReactNode }) => {
  const { userId } = await auth();
  const gate = await resolveAdminAccess(userId);
  const locale = i18n.defaultLocale;

  if (gate.status === "unauthenticated" || gate.status === "unavailable") {
    redirect(`/${locale}/admin/login?redirectTo=/studio`);
  }
  if (gate.status === "denied") {
    redirect(`/${locale}/admin/access-denied`);
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
