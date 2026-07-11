import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient, client } from "@/sanity/lib/client";
import { refundOrderPayment } from "@/lib/stripeRefund";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        totalPrice,
        amountPaid,
        paymentMethod,
        paymentStatus,
        status,
        stripePaymentIntentId,
        clerkUserId
      }`,
      { orderId },
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 },
      );
    }

    // Customers may only self-cancel (and trigger an automatic refund) while the
    // order is still early in fulfillment. Once it is packed/shipped/out for
    // delivery/delivered, it must go through an admin-reviewed cancellation.
    const SELF_CANCELLABLE_STATUSES = ["pending", "processing"];
    if (!SELF_CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        {
          error:
            "This order is already being prepared for delivery and can no longer be cancelled automatically. Please contact support to request a cancellation.",
        },
        { status: 400 },
      );
    }

    const refundResult = await refundOrderPayment(order);

    if (
      refundResult.manualRefundRequired &&
      refundResult.refundAmount > 0 &&
      !refundResult.stripeRefunded &&
      (order.paymentMethod === "stripe" || order.paymentMethod === "card")
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to process your refund automatically. Please contact support and we will help you.",
        },
        { status: 502 },
      );
    }

    await writeClient
      .patch(orderId)
      .set({
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: userId,
        stripeRefundId: refundResult.stripeRefundId || undefined,
        paymentStatus: refundResult.stripeRefunded
          ? "refunded"
          : order.paymentStatus,
        refundAmount: refundResult.stripeRefunded
          ? refundResult.refundAmount
          : undefined,
        refundedToWallet: false,
      })
      .commit();

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        refundAmount:
          refundResult.stripeRefunded || refundResult.manualRefundRequired
            ? refundResult.refundAmount
            : 0,
        stripeRefunded: refundResult.stripeRefunded,
        manualRefundRequired: refundResult.manualRefundRequired,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
