import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  sendOrderConfirmationEmail,
  OrderConfirmationData,
} from "@/lib/emailService";
import { getEmailImageUrl } from "@/lib/emailImageUtils";
import { readClient } from "@/sanity/lib/client";
import { PAYMENT_METHODS } from "@/lib/orderStatus";

// Extended interface for email preparation that can handle Sanity images
interface EmailOrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string | { asset?: { _ref?: string; url?: string } };
}

interface EmailOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: EmailOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const { orderData }: { orderData: EmailOrderData } = await request.json();

    if (!orderData?.orderId || !orderData?.customerEmail) {
      return NextResponse.json(
        { error: "Order number and customer email are required" },
        { status: 400 },
      );
    }

    // Never trust client-supplied totals or addresses for sending email — load
    // the authoritative order and verify the caller is allowed to trigger it.
    const order = await readClient.fetch<{
      _id: string;
      orderNumber: string;
      email?: string;
      clerkUserId?: string;
      paymentMethod?: string;
      paymentStatus?: string;
      status?: string;
      customerName?: string;
      orderDate?: string;
      subtotal?: number;
      shipping?: number;
      tax?: number;
      totalPrice?: number;
      address?: {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
      };
      products?: Array<{
        quantity: number;
        weight?: { price?: number };
        product?: { name?: string; price?: number; image?: unknown };
      }>;
    } | null>(
      `*[_type == "order" && orderNumber == $orderNumber][0]{
        _id,
        orderNumber,
        email,
        clerkUserId,
        paymentMethod,
        paymentStatus,
        status,
        customerName,
        orderDate,
        subtotal,
        shipping,
        tax,
        totalPrice,
        address,
        products[]{
          quantity,
          weight,
          product->{ name, price, "image": images[0] }
        }
      }`,
      { orderNumber: orderData.orderId },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderEmail = order.email?.toLowerCase();
    const requestEmail = orderData.customerEmail.toLowerCase();

    if (!orderEmail || orderEmail !== requestEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (userId && order.clerkUserId && order.clerkUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Stripe confirmations are sent by the webhook after payment succeeds.
    // This endpoint is only for COD placement-time emails.
    if (order.paymentMethod !== PAYMENT_METHODS.CASH_ON_DELIVERY) {
      return NextResponse.json(
        { error: "Confirmation email is sent after online payment completes" },
        { status: 400 },
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot send confirmation for a cancelled order" },
        { status: 400 },
      );
    }

    const emailDataWithImages: OrderConfirmationData = {
      customerName: order.customerName || orderData.customerName || "Customer",
      customerEmail: order.email || orderData.customerEmail,
      orderId: order.orderNumber,
      orderDate: order.orderDate
        ? new Date(order.orderDate).toLocaleDateString()
        : orderData.orderDate,
      items: (order.products || []).map((item) => ({
        name: item.product?.name || "Product",
        price: item.weight?.price || item.product?.price || 0,
        quantity: item.quantity,
        image: getEmailImageUrl(
          item.product?.image as Parameters<typeof getEmailImageUrl>[0],
        ),
      })),
      subtotal: order.subtotal ?? orderData.subtotal,
      shipping: order.shipping ?? orderData.shipping,
      tax: order.tax ?? orderData.tax,
      total: order.totalPrice ?? orderData.total,
      shippingAddress: {
        name: order.address?.name || orderData.shippingAddress.name,
        street: order.address?.address || orderData.shippingAddress.street,
        city: order.address?.city || orderData.shippingAddress.city,
        state: order.address?.state || orderData.shippingAddress.state,
        zipCode: order.address?.zip || orderData.shippingAddress.zipCode,
        country: orderData.shippingAddress.country || "United States",
      },
      estimatedDelivery: orderData.estimatedDelivery,
    };

    const emailResult = await sendOrderConfirmationEmail(emailDataWithImages);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        messageId: emailResult.messageId,
        message: "Email sent successfully",
      });
    }

    console.error(
      "Failed to send order confirmation email:",
      emailResult.error,
    );
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
