import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about Sheba's Coffee, our story, values, and the team behind your favorite coffee destination.",
};

const AboutPage = () => {
  return <AboutClient />;
};

export default AboutPage;
