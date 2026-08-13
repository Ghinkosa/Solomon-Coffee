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
  const skipLabel =
    dictionary?.a11y?.skipToContent ?? "Skip to main content";

  return (
    <DictionaryProvider dictionary={dictionary}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-shop_dark_green focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        {skipLabel}
      </a>
      <Header lang={lang as Locale} dictionary={dictionary} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer lang={lang} dictionary={dictionary} />
    </DictionaryProvider>
  );
}
