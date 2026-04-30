import { Metadata } from "next";
import RoastingClient from "./RoastingClient";

export const metadata: Metadata = {
  title: "The Art of the Roast | Sheba Cup Coffee",
  description:
    "Discover the precision, passion, and heritage behind our roasting process. Learn how we bring the authentic Ethiopian farm flavor into every cup.",
};

const RoastingPage = () => {
  return <RoastingClient />;
};

export default RoastingPage;