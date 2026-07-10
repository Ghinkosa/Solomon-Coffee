import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.privacyPage?.meta?.title ?? "Privacy Policy",
    description:
      dictionary.privacyPage?.meta?.description ??
      "Learn how Sheba Cup Coffee collects, uses, and protects your personal information.",
  };
}

const PrivacyPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <PrivacyClient dictionary={dictionary} />;
};

export default PrivacyPage;
