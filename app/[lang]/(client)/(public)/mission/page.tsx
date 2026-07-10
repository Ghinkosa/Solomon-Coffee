import { Metadata } from "next";
import MissionClient from "./MissionClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.missionPage?.meta?.title ?? "Our Mission",
    description:
      dictionary.missionPage?.meta?.description ??
      "Discover how Sheba Cup Coffee supports childhood cancer care in Ethiopia with every bag sold.",
  };
}

const MissionPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <MissionClient dictionary={dictionary} />;
};

export default MissionPage;
