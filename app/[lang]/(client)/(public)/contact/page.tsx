import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Sheba's Coffee. We're here to help with your questions and inquiries.",
};

interface Props {
  params: Promise<{ lang: Locale }>;
}

const ContactPage = async ({ params }: Props) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <ContactClient dictionary={dictionary} />;
};

export default ContactPage;
