import { Metadata } from "next";
import OurCoffee from "./OurCoffee";

export const metadata: Metadata = {
  title: "Our Coffee | Sheba Cup Coffee",
  description:
    "Discover our coffee processing methods - Natural, Washed, and Honey processes that create exceptional flavors.",
};

export default async function CoffeePage() {
  return <OurCoffee />;
}