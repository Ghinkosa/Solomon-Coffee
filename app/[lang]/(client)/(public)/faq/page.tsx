import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Sheba's Coffee, shipping, payments, and more.",
};

const FAQPage = () => {
  return <FAQClient />;
};

export default FAQPage;
