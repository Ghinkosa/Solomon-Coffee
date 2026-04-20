import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
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
    <>
      <Header lang={lang as Locale} />
      {children}
      <Footer lang={lang} dictionary={dictionary} />
    </>
  );
}
