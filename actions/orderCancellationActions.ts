"use server";

import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/adminUtils";
import {
  refundOrderPayment,
  buildRefundMessage,
} from "@/lib/stripeRefund";
import { restoreOrderStock } from "@/lib/stock";

/**
 * Admin: Approve cancellation request and cancel order with refund
 */
export async function approveCancellationRequest(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, message: "Unauthorized" };
    }

    const adminUser = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{ email, isAdmin }`,
      { clerkUserId },
    );

    if (!isAdmin(adminUser)) {
      return {
        success: false,
        message: "Admin access required to approve cancellation requests",
      };
    }

    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        status,
        paymentStatus,
        totalPrice,
        amountPaid,
        paymentMethod,
        stripePaymentIntentId,
        clerkUserId,
        cancellationRequested,
        cancellationRequestReason
      }`,
      { orderId },
    );

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (!order.cancellationRequested) {
      return {
        success: false,
        message: "No cancellation request found for this order",
      };
    }

    if (order.status === "cancelled") {
      return { success: false, message: "Order is already cancelled" };
    }

    const refundResult = await refundOrderPayment(order);

    await backendClient
      .patch(orderId)
      .set({
        status: "cancelled",
        paymentStatus: refundResult.stripeRefunded
          ? "refunded"
          : order.paymentStatus === "paid"
            ? "paid"
            : "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: adminUser.email,
        cancellationReason: order.cancellationRequestReason,
        stripeRefundId: refundResult.stripeRefundId || undefined,
        refundAmount: refundResult.stripeRefunded
          ? refundResult.refundAmount
          : undefined,
        refundedToWallet: false,
        cancellationRequested: false,
      })
      .commit();

    // Return the reserved inventory (idempotent; no-op if never decremented).
    await restoreOrderStock(orderId);

    try {
      await sendOrderStatusNotification({
        clerkUserId: order.clerkUserId,
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: "cancelled",
      });
    } catch (notificationError) {
      console.error(
        "Failed to send cancellation notification:",
        notificationError,
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");

    return {
      success: true,
      message: buildRefundMessage(refundResult, { adminContext: true }),
    };
  } catch (error) {
    console.error("Error approving cancellation request:", error);
    return {
      success: false,
      message: "Failed to approve cancellation request",
    };
  }
}

/**
 * Admin: Reject cancellation request and proceed with order confirmation
 */
export async function rejectCancellationRequest(
  orderId: string,
  rejectionReason?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, message: "Unauthorized" };
    }

    const adminUser = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{ email, isAdmin }`,
      { clerkUserId },
    );

    if (!isAdmin(adminUser)) {
      return {
        success: false,
        message: "Admin access required to reject cancellation requests",
      };
    }

    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        status,
        cancellationRequested,
        clerkUserId
      }`,
      { orderId },
    );

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (!order.cancellationRequested) {
      return {
        success: false,
        message: "No cancellation request found for this order",
      };
    }

    await backendClient
      .patch(orderId)
      .set({
        cancellationRequested: false,
        cancellationRequestedAt: null,
        cancellationRequestReason: null,
        status: "confirmed",
        orderConfirmedBy: adminUser.email,
        orderConfirmedAt: new Date().toISOString(),
      })
      .commit();

    try {
      await sendOrderStatusNotification({
        clerkUserId: order.clerkUserId,
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: "confirmed",
        previousStatus: order.status,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send confirmation notification:",
        notificationError,
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");

    return {
      success: true,
      message: rejectionReason
        ? `Cancellation request rejected: ${rejectionReason}. Order confirmed.`
        : "Cancellation request rejected. Order confirmed and will be processed.",
    };
  } catch (error) {
    console.error("Error rejecting cancellation request:", error);
    return { success: false, message: "Failed to reject cancellation request" };
  }
}

/**
 * Admin: Cancel order and refund via Stripe when applicable
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, message: "Unauthorized" };
    }

    const adminUser = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{ email, isAdmin }`,
      { clerkUserId },
    );

    if (!isAdmin(adminUser)) {
      return {
        success: false,
        message: "Admin access required to cancel orders",
      };
    }

    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        status,
        paymentStatus,
        totalPrice,
        amountPaid,
        paymentMethod,
        stripePaymentIntentId,
        clerkUserId
      }`,
      { orderId },
    );

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.status === "cancelled") {
      return { success: false, message: "Order is already cancelled" };
    }

    if (order.status === "delivered") {
      return {
        success: false,
        message:
          "Cannot cancel delivered orders. Please process a return instead.",
      };
    }

    const refundResult = await refundOrderPayment(order);

    await backendClient
      .patch(orderId)
      .set({
        status: "cancelled",
        paymentStatus: refundResult.stripeRefunded
          ? "refunded"
          : order.paymentStatus === "paid"
            ? "paid"
            : "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: adminUser.email,
        cancellationReason: reason,
        stripeRefundId: refundResult.stripeRefundId || undefined,
        refundAmount: refundResult.stripeRefunded
          ? refundResult.refundAmount
          : undefined,
        refundedToWallet: false,
      })
      .commit();

    // Return the reserved inventory (idempotent; no-op if never decremented).
    await restoreOrderStock(orderId);

    try {
      await sendOrderStatusNotification({
        clerkUserId: order.clerkUserId,
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: "cancelled",
      });
    } catch (notificationError) {
      console.error(
        "Failed to send cancellation notification:",
        notificationError,
      );
    }

    return {
      success: true,
      message: buildRefundMessage(refundResult, { adminContext: true }),
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      message: "Failed to cancel order",
    };
  }
}

/**
 * User: Request order cancellation (before shipping)
 * Sets cancellationRequested flag for admin approval
 */
export async function requestOrderCancellation(
  orderId: string,
  reason: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, message: "Unauthorized" };
    }

    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId && clerkUserId == $clerkUserId][0]{
        _id,
        orderNumber,
        status,
        paymentStatus,
        cancellationRequested
      }`,
      { orderId, clerkUserId },
    );

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.status === "cancelled") {
      return { success: false, message: "Order is already cancelled" };
    }

    if (order.cancellationRequested) {
      return {
        success: false,
        message: "Cancellation request already pending admin approval",
      };
    }

    if (order.status === "delivered") {
      return {
        success: false,
        message:
          "Cannot cancel delivered orders. Please contact support for returns.",
      };
    }

    if (order.status === "shipped" || order.status === "out_for_delivery") {
      return {
        success: false,
        message:
          "Order is already shipped. Please contact support to process cancellation.",
      };
    }

    await backendClient
      .patch(orderId)
      .set({
        cancellationRequested: true,
        cancellationRequestedAt: new Date().toISOString(),
        cancellationRequestReason: reason,
      })
      .commit();

    return {
      success: true,
      message:
        "Cancellation request submitted. Our team will review and process your request shortly.",
    };
  } catch (error) {
    console.error("Error requesting order cancellation:", error);
    return {
      success: false,
      message: "Failed to submit cancellation request",
    };
  }
}
