import { Metadata } from "next";
import FaqsClient from "./FaqsClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.faqsPage?.meta?.title ?? "FAQs",
    description:
      dictionary.faqsPage?.meta?.description ??
      "Frequently asked questions about Sheba Cup Coffee orders, shipping, and quality.",
  };
}

const FaqsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <FaqsClient dictionary={dictionary} />;
};

export default FaqsPage;
