import { Metadata } from "next";
import RoastingClient from "./RoastingClient";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "The Art of the Roast | Sheba's Coffee",
=======
  title: "The Art of the Roast | Solomon's Coffee",
>>>>>>> 88c4da277ced64b47f1ac3c0650594ef040c7133
  description:
    "Discover the precision, passion, and heritage behind our roasting process. Learn how we bring the authentic Ethiopian farm flavor into every cup.",
};

const RoastingPage = () => {
  return <RoastingClient />;
};

export default RoastingPage;