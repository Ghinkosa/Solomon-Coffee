import { Metadata } from "next";
import TermsClient from "./TermsClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.termsPage?.meta?.title ?? "Terms of Service",
    description:
      dictionary.termsPage?.meta?.description ??
      "Read the terms and conditions for using Sheba Cup Coffee services.",
  };
}

const TermsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <TermsClient dictionary={dictionary} />;
};

export default TermsPage;
