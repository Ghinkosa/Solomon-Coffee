import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/sanity/queries";
import { currentUser } from "@clerk/nextjs/server";
import OrderDetailsPage from "@/components/OrderDetailsPage";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import { t } from "@/lib/dictionary-utils";

interface Props {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const order = await getOrderById(id);

  if (!order) {
    return {
      title: t(
        dictionary,
        "userDashboard.orders.detail.metaNotFound",
        "Order Not Found"
      ),
    };
  }

  const title = t(
    dictionary,
    "userDashboard.orders.detail.metaTitle",
    "Order {number}"
  ).replace("{number}", order.orderNumber);

  return {
    title: `${title} - Sheba Cup Coffee`,
    description: `${title} - ${order.customerName}`,
  };
}

export default async function OrderDetailsPageRoute({ params }: Props) {
  const user = await currentUser();
  const { id } = await params;

  if (!user) {
    notFound();
  }

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  if (order.clerkUserId !== user.id) {
    notFound();
  }

  return (
    <div className="w-full">
      <OrderDetailsPage order={order} />
    </div>
  );
}
