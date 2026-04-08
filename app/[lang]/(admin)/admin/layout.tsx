import React from "react";
import Container from "@/components/Container";
import AdminTopNavigation from "@/components/admin/AdminTopNavigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

import { currentUser } from "@clerk/nextjs/server";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

const AdminLayout = async ({ children, params }: AdminLayoutProps) => {
  const { lang } = await params;
  const user = await currentUser();
  const dictionary = await getDictionary(lang as Locale);

  const serializedUser = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddresses: user.emailAddresses.map((email: any) => ({
          emailAddress: email.emailAddress,
        })),
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : null,
      }
    : null;

  return (
    <div className="min-h-screen">
      <AdminAuthGuard>
        <Header lang={lang as Locale} />
        <Container className="py-6">
          <div className="flex flex-col gap-6">
            <AdminTopNavigation user={serializedUser as any} />

            {/* Main Content */}
            <div className="admin-content-push bg-white rounded-2xl shadow-xl border border-shop_light_green/10 overflow-hidden">
              {children}
            </div>
          </div>
        </Container>
        <Footer lang={lang} dictionary={dictionary} />
      </AdminAuthGuard>
    </div>
  );
};

export default AdminLayout;
