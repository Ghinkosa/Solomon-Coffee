"use server";

import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { revalidatePath } from "next/cache";
import { resolveAdminAccess } from "@/lib/adminGate";
import {
  refundOrderPayment,
  buildRefundMessage,
} from "@/lib/stripeRefund";
import { restoreOrderStock } from "@/lib/stock";

async function requireAdminForCancellation(): Promise<
  { ok: true; email: string } | { ok: false; message: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }

  const gate = await resolveAdminAccess(userId);
  if (gate.status === "admin") {
    return { ok: true, email: gate.email };
  }
  if (gate.status === "unavailable") {
    return {
      ok: false,
      message: "Admin verification unavailable. Try again shortly.",
    };
  }
  return {
    ok: false,
    message: "Admin access required to manage cancellation requests",
  };
}

/**
 * Admin: Approve cancellation request and cancel order with refund
 */
export async function approveCancellationRequest(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const gate = await requireAdminForCancellation();
    if (!gate.ok) {
      return { success: false, message: gate.message };
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
        email,
        customerName,
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
        cancelledBy: gate.email,
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

    try {
      const { maybeSendOrderMilestoneEmail } = await import(
        "@/lib/emails/orderHooks"
      );
      await maybeSendOrderMilestoneEmail({
        status: "cancelled",
        orderNumber: order.orderNumber,
        customerEmail: order.email,
        customerName: order.customerName,
        clerkUserId: order.clerkUserId,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
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
    const gate = await requireAdminForCancellation();
    if (!gate.ok) {
      return { success: false, message: gate.message };
    }

    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        status,
        cancellationRequested,
        clerkUserId,
        email,
        customerName
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
        status: "order_confirmed",
        orderConfirmedBy: gate.email,
        orderConfirmedAt: new Date().toISOString(),
      })
      .commit();

    try {
      await sendOrderStatusNotification({
        clerkUserId: order.clerkUserId,
        orderNumber: order.orderNumber,
        orderId: order._id,
        status: "order_confirmed",
        previousStatus: order.status,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send confirmation notification:",
        notificationError,
      );
    }

    try {
      const { maybeSendOrderMilestoneEmail } = await import(
        "@/lib/emails/orderHooks"
      );
      await maybeSendOrderMilestoneEmail({
        status: "order_confirmed",
        orderNumber: order.orderNumber,
        customerEmail: order.email,
        customerName: order.customerName,
        clerkUserId: order.clerkUserId,
        milestoneOverride: "cancellation_rejected",
        reason: rejectionReason,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation rejection email:", emailError);
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
    const gate = await requireAdminForCancellation();
    if (!gate.ok) {
      return { success: false, message: gate.message };
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
        email,
        customerName
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
        cancelledBy: gate.email,
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

    try {
      const { maybeSendOrderMilestoneEmail } = await import(
        "@/lib/emails/orderHooks"
      );
      await maybeSendOrderMilestoneEmail({
        status: "cancelled",
        orderNumber: order.orderNumber,
        customerEmail: order.email,
        customerName: order.customerName,
        clerkUserId: order.clerkUserId,
        reason,
      });
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");

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
        cancellationRequested,
        email,
        customerName
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

    try {
      const { notifyAdminsCancellationRequest } = await import(
        "@/lib/emails/adminEmails"
      );
      await notifyAdminsCancellationRequest({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.email,
        reason,
      });
    } catch (emailError) {
      console.error("Failed to notify admins of cancellation request:", emailError);
    }

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
