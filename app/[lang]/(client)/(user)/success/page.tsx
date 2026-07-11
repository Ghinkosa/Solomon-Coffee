"use client";

import {
  Check,
  Home,
  Package,
  ShoppingBag,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";
import type { QueryResult } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";
import { useUser } from "@clerk/nextjs";
import useCartStore from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PriceFormatter from "@/components/PriceFormatter";
import { format } from "date-fns";

const SuccessContent = () => {
  const toLocalizedPath = useLocalizedPath();
  const dictionary = useDictionary();
  const s = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.checkoutSuccess.${path}`, fallback);
  const getStatusLabel = (status?: string | null) => {
    if (!status) {
      return t(dictionary, "userDashboard.orders.list.status.pending", "Pending");
    }
    const key = status.toLowerCase().replace(/\s+/g, "_");
    return t(
      dictionary,
      `userDashboard.orders.list.status.${key}`,
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  const [orders, setOrders] = useState<QueryResult>([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const isGuestOrder = searchParams.get("guest") === "true";

  const { user } = useUser();
  const userId = user?.id;
  const { resetCart } = useCartStore();

  const query =
    defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
  ...,products[]{
    ...,product->
  }
}`);

  useEffect(() => {
    if (!orderNumber) return;

    const pendingOrder = sessionStorage.getItem("pendingCheckoutOrder");
    const completedOrder = sessionStorage.getItem("completedOrder");

    if (pendingOrder === orderNumber || completedOrder === orderNumber) {
      resetCart();
      sessionStorage.removeItem("pendingCheckoutOrder");
      sessionStorage.removeItem("completedOrder");
    }
  }, [orderNumber, resetCart]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.log("User ID not found. Cannot fetch orders.");
        return;
      }

      try {
        const ordersData = await client.fetch(query, { userId });
        setOrders(ordersData as QueryResult);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchData();
  }, [userId, query]);

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Check className="text-white w-12 h-12" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {s("title", "Order Placed Successfully!")}
          </h1>

          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {s(
              "thankYou",
              "Thank you for your purchase! Your order has been confirmed and we're preparing it for shipment. You'll receive a confirmation email"
            )}
          </p>

          {orderNumber && (
            <div className="bg-white rounded-lg p-6 shadow-md inline-block">
              <div className="flex items-center justify-center gap-3">
                <Package className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 font-medium">
                  {s("orderNumber", "Order Number:")}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {orderNumber}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {s("whatNext", "What happens next?")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {s("steps.processing.title", "Order Processing")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {s(
                      "steps.processing.description",
                      "We're preparing your items for shipment"
                    )}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {s("steps.shipping.title", "Shipping")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {s(
                      "steps.shipping.description",
                      "Your order will be shipped within 2-3 business days"
                    )}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {s("steps.delivery.title", "Delivery")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {s(
                      "steps.delivery.description",
                      "Delivered to your doorstep with tracking updates"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {s("recentOrders", "Your Recent Orders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(showAllOrders ? orders : orders.slice(0, 2)).map(
                    (order) => (
                      <div
                        key={order?._id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {s("orderLabel", "Order #")}
                              {order.orderNumber?.slice(-8) ||
                                order._id.slice(-8)}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {order.orderDate
                                  ? format(
                                      new Date(order.orderDate),
                                      "MMM dd, yyyy",
                                    )
                                  : s("notAvailable", "N/A")}
                              </div>
                              <PriceFormatter amount={order.totalPrice || 0} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              order.status === "completed" ||
                              order.status === "delivered"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                          <Button asChild size="sm" variant="outline">
                            <Link href={toLocalizedPath(`/user/orders/${order._id}`)}>
                              <Eye className="w-3 h-3 mr-1" />
                              {s("view", "View")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ),
                  )}

                  {orders.length > 2 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowAllOrders(!showAllOrders)}
                        className="text-sm"
                      >
                        {showAllOrders
                          ? s("showLess", "Show Less")
                          : s("showAll", "Show All {count} Orders").replace(
                              "{count}",
                              String(orders.length)
                            )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          <Button asChild size="lg" className="h-12">
            <Link href={toLocalizedPath("/")} className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              {s("continueShopping", "Continue Shopping")}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12">
            <Link
              href={
                isGuestOrder || !user
                  ? toLocalizedPath("/order/track")
                  : toLocalizedPath("/user/orders")
              }
              className="flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              {isGuestOrder || !user
                ? s("trackOrder", "Track Order")
                : s("trackOrders", "Track Orders")}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12">
            <Link
              href={toLocalizedPath("/shop")}
              className="flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {s("shopMore", "Shop More")}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;
