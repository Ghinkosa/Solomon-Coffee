import { Metadata } from "next";
import FAQClient from "./FAQClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.faqPage?.meta?.title ?? "FAQ",
    description:
      dictionary.faqPage?.meta?.description ??
      "Search our knowledge base for answers about shopping, payments, shipping, and your account.",
  };
}

const FAQPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <FAQClient dictionary={dictionary} />;
};

export default FAQPage;
