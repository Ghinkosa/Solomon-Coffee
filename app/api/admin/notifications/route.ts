import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { readClient } from "@/sanity/lib/client";

interface Order {
  _id: string;
  _createdAt: string;
  orderNumber?: string;
  customerName?: string;
  email?: string;
  totalPrice: number;
}

interface Product {
  _id: string;
  name: string;
  title?: string;
  stock: number;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    // Get recent orders for notifications
    const recentOrders = await readClient.fetch(`
      *[_type == "order"] | order(_createdAt desc) [0...10] {
        _id,
        _createdAt,
        orderNumber,
        customerName,
        email,
        totalPrice,
        status
      }
    `);

    // Get recent products for low stock notifications
    const lowStockProducts = await readClient.fetch(`
      *[_type == "product" && stock < 10] | order(_createdAt desc) [0...5] {
        _id,
        title,
        stock
      }
    `);

    // Generate notifications from live data only
    const notifications = [
      ...recentOrders.map((order: Order) => ({
        id: `order-${order._id}`,
        title: `New order ${order.orderNumber || `#${order._id.slice(-6)}`}`,
        description: `${order.customerName || order.email} - $${
          order.totalPrice
        }`,
        time: getTimeAgo(new Date(order._createdAt)),
        type: "order",
        icon: "shopping-cart",
      })),

      ...lowStockProducts.map((product: Product) => ({
        id: `stock-${product._id}`,
        title: "Low stock alert",
        description: `${product.title} - Only ${product.stock} left`,
        time: "Today",
        type: "warning",
        icon: "alert-triangle",
      })),
    ].slice(0, 15);

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}
