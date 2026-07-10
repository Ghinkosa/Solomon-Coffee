import { Metadata } from "next";
import HelpClient from "./HelpClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.helpPage?.meta?.title ?? "Help Center",
    description:
      dictionary.helpPage?.meta?.description ??
      "Find answers and support for orders, shipping, payments, and brewing.",
  };
}

const HelpPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <HelpClient dictionary={dictionary} />;
};

export default HelpPage;
