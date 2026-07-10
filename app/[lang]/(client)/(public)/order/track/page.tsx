import { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

interface Props {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.ordersTrack?.title ?? "Track your order",
    description:
      dictionary.ordersTrack?.subtitle ??
      "Enter your order number and email to view your order status.",
  };
}

export default async function TrackOrderPage({ params }: Props) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <TrackOrderClient dictionary={dictionary} />;
}
