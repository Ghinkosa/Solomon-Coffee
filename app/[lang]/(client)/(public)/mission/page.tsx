import { Metadata } from "next";
import MissionClient from "./MissionClient";

export const metadata: Metadata = {
  title: "Our Mission | Sheba Cup Coffee - Coffee with a Purpose",
  description:
    "Every bag of Sheba Cup Coffee supports childhood cancer care in Ethiopia through the Mathiwos Wondu Foundation. Your purchase helps provide screenings, treatment support, and care for families.",
};

const MissionPage = () => {
  return <MissionClient />;
};

export default MissionPage;