import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.contact?.hero?.title ?? "Contact Us",
    description:
      dictionary.contact?.hero?.description ??
      "Get in touch with Sheba Cup Coffee. We're here to help with your questions and inquiries.",
  };
}

const ContactPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <ContactClient dictionary={dictionary} />;
};

export default ContactPage;
