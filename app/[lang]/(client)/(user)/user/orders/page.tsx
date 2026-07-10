import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/sanity/helpers";
import Title from "@/components/Title";
import OrdersClient from "@/components/OrdersClient";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import { t } from "@/lib/dictionary-utils";

interface OrdersPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

async function UserOrdersPage({ params, searchParams }: OrdersPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const ordersPerPage = 20;

  const orderData = await getMyOrders(user.id, currentPage, ordersPerPage);
  const { orders, totalCount, totalPages, hasNextPage, hasPrevPage } =
    orderData;

  const showingText = t(
    dictionary,
    "userDashboard.orders.showing",
    "Showing {count} of {total} orders",
  )
    .replace("{count}", String(orders.length))
    .replace("{total}", String(totalCount));

  return (
    <div className="space-y-6">
      <div>
        <Title>{t(dictionary, "userDashboard.orders.title", "My Orders")}</Title>
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground mt-2">{showingText}</p>
        )}
      </div>

      <OrdersClient
        initialOrders={orders}
        totalPages={totalPages}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}

export default UserOrdersPage;
