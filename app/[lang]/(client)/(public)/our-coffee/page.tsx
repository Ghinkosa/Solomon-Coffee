import { Metadata } from "next";
import OurCoffee from "./OurCoffee";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.ourCoffeePage?.meta?.title ?? "Our Coffee",
    description:
      dictionary.ourCoffeePage?.meta?.description ??
      "Explore the origins, farms, and processing behind Sheba Cup Coffee.",
  };
}

export default async function CoffeePage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <OurCoffee dictionary={dictionary} />;
}
