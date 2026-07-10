import { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.aboutPage?.meta?.title ?? "About Us",
    description:
      dictionary.aboutPage?.meta?.description ??
      "Learn more about Sheba Cup Coffee, our story, values, and the team behind your favorite coffee destination.",
  };
}

const AboutPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <AboutClient dictionary={dictionary} />;
};

export default AboutPage;
