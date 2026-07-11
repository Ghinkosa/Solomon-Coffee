import { Metadata } from "next";
import { contactConfig } from "@/config/contact";
import { getDictionary } from "@/lib/dictionary";
import { DictionaryProvider } from "@/lib/dictionary-context";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: `Authentication - ${contactConfig.company.name}`,
  description: `Sign in or create an account with ${contactConfig.company.name} to access exclusive coffee offers, track orders, and save your brewing preferences.`,
  keywords: [
    "sign in",
    "sign up",
    "login",
    "register",
    "account",
    "authentication",
  ],
};

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      <div className="auth-layout">{children}</div>
    </DictionaryProvider>
  );
}
