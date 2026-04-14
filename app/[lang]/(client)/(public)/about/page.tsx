import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about ShopCart, our story, values, and the team behind your favorite online shopping destination.",
};

const AboutPage = () => {
  return <AboutClient />;
};

export default AboutPage;
