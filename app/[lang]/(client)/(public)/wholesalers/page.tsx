import { Metadata } from "next";
import WholesalersClient from "./WholesalersClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Wholesale Program | Sheba Cup Coffee",
  description:
    "Partner with Sheba Cup Coffee for wholesale roasted coffee. Request information and our team will reach out.",
};

interface Props {
  params: Promise<{ lang: Locale }>;
}

const WholesalersPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <WholesalersClient dictionary={dictionary} />;
};

export default WholesalersPage;
