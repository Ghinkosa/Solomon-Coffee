import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDictionary } from "@/lib/dictionary";
import { DictionaryProvider } from "@/lib/dictionary-context";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Public admin routes (login, access-denied) and the guarded console
 * share this passthrough layout. Console chrome lives in (console)/layout.
 */
export default async function AdminRootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <DictionaryProvider dictionary={dictionary}>{children}</DictionaryProvider>
  );
}
