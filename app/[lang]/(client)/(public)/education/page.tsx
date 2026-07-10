import { Metadata } from "next";
import RoastingClient from "./RoastingClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.educationPage?.meta?.title ?? "Our Roasting Process",
    description:
      dictionary.educationPage?.meta?.description ??
      "Learn how we roast Ethiopian specialty coffee with care from green bean to cup.",
  };
}

const RoastingPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <RoastingClient dictionary={dictionary} />;
};

export default RoastingPage;
