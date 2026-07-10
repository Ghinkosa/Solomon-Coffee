import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { DictionaryProvider } from "@/lib/dictionary-context";
import { Locale } from "@/i18n-config";

export default async function ClientLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  return (
    <DictionaryProvider dictionary={dictionary}>
      <Header lang={lang as Locale} dictionary={dictionary} />
      {children}
      <Footer lang={lang} dictionary={dictionary} />
    </DictionaryProvider>
  );
}
