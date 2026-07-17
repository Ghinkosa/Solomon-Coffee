import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { writeClient } from "@/sanity/lib/client";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { refundOrderPayment, buildRefundMessage } from "@/lib/stripeRefund";
import { restoreOrderStock } from "@/lib/stock";
import { buildTimelineFieldsForStatus } from "@/lib/orderTimelineSync";
import { invalidateOrder } from "@/lib/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { id } = await params;
    const updateData = await req.json();

    const currentOrder = await writeClient.fetch(
      `*[_type == "order" && _id == $id][0] {
        _id,
        orderNumber,
        status,
        paymentStatus,
        paymentMethod,
        stripePaymentIntentId,
        totalPrice,
        amountPaid,
        clerkUserId,
        email,
        customerName,
        addressConfirmedAt,
        addressConfirmedBy,
        orderConfirmedAt,
        orderConfirmedBy,
        packedAt,
        packedBy,
        dispatchedAt,
        dispatchedBy,
        deliveredAt,
        deliveredBy,
        statusHistory,
        user -> {
          clerkUserId,
          email,
          firstName,
          lastName
        }
      }`,
      { id },
    );

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowedFields = [
      "status",
      "totalPrice",
      "paymentStatus",
      "trackingNumber",
      "notes",
      "estimatedDelivery",
      "actualDelivery",
      "addressConfirmedBy",
      "addressConfirmedAt",
      "orderConfirmedBy",
      "orderConfirmedAt",
      "packedBy",
      "packedAt",
      "packingNotes",
      "dispatchedBy",
      "dispatchedAt",
      "assignedWarehouseBy",
      "assignedWarehouseAt",
      "assignedDeliverymanId",
      "assignedDeliverymanName",
      "deliveredBy",
      "deliveredAt",
      "deliveryNotes",
      "deliveryAttempts",
      "rescheduledDate",
      "rescheduledReason",
      "cashCollected",
      "cashCollectedAmount",
      "cashCollectedAt",
      "paymentReceivedBy",
      "paymentReceivedAt",
      "cancelledAt",
      "cancelledBy",
      "refundedToWallet",
      "refundAmount",
      "statusHistory",
    ];

    const filteredUpdateData: Record<string, unknown> = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    filteredUpdateData._updatedAt = new Date().toISOString();

    let stripeRefunded = false;
    let refundAmount = 0;
    let manualRefundRequired = false;

    if (
      updateData.status === "cancelled" &&
      currentOrder.status !== "cancelled"
    ) {
      const refundResult = await refundOrderPayment(currentOrder);

      stripeRefunded = refundResult.stripeRefunded;
      refundAmount = refundResult.refundAmount;
      manualRefundRequired = refundResult.manualRefundRequired;

      if (stripeRefunded) {
        filteredUpdateData.refundAmount = refundAmount;
        if (refundResult.stripeRefundId) {
          filteredUpdateData.stripeRefundId = refundResult.stripeRefundId;
        }
        filteredUpdateData.paymentStatus = "refunded";
      }

      filteredUpdateData.refundedToWallet = false;
      filteredUpdateData.cancelledAt = new Date().toISOString();
      filteredUpdateData.cancelledBy = admin.userEmail || "admin";
    }

    // Sync customer OrderTimeline timestamps when admin changes status
    if (
      typeof updateData.status === "string" &&
      updateData.status !== currentOrder.status
    ) {
      const timelinePatch = buildTimelineFieldsForStatus(
        updateData.status,
        currentOrder,
        admin.userEmail || "admin",
        {
          notes:
            typeof updateData.notes === "string" && updateData.notes.trim()
              ? updateData.notes.trim()
              : undefined,
        },
      );
      Object.assign(filteredUpdateData, timelinePatch);
    }

    const updatedOrder = await writeClient
      .patch(id)
      .set(filteredUpdateData)
      .commit();

    if (
      updateData.status === "cancelled" &&
      currentOrder.status !== "cancelled"
    ) {
      await restoreOrderStock(id);
    }

    if (updateData.status && updateData.status !== currentOrder.status) {
      try {
        const userClerkId =
          currentOrder.clerkUserId || currentOrder.user?.clerkUserId;

        if (userClerkId) {
          await sendOrderStatusNotification({
            clerkUserId: userClerkId,
            orderNumber: currentOrder.orderNumber,
            orderId: id,
            status: updateData.status,
            previousStatus: currentOrder.status,
          });
        } else {
          console.warn(
            `Cannot send notification: No clerkUserId found for order ${id}`,
          );
        }
      } catch (notificationError) {
        console.error(
          "Failed to send order status notification:",
          notificationError,
        );
      }

      try {
        const { maybeSendOrderMilestoneEmail } = await import(
          "@/lib/emails/orderHooks"
        );
        await maybeSendOrderMilestoneEmail({
          status: String(updateData.status),
          orderNumber: currentOrder.orderNumber,
          customerEmail:
            currentOrder.email || currentOrder.user?.email || null,
          customerName:
            currentOrder.customerName ||
            [currentOrder.user?.firstName, currentOrder.user?.lastName]
              .filter(Boolean)
              .join(" ") ||
            null,
          clerkUserId:
            currentOrder.clerkUserId || currentOrder.user?.clerkUserId,
        });
      } catch (milestoneEmailError) {
        console.error(
          "Failed to send order milestone email:",
          milestoneEmailError,
        );
      }

      await invalidateOrder(
        id,
        currentOrder.clerkUserId || currentOrder.user?.clerkUserId,
      );
    }

    const refundResult = {
      stripeRefunded,
      manualRefundRequired,
      refundAmount,
    };

    const wasCancelled =
      updateData.status === "cancelled" && currentOrder.status !== "cancelled";
    const statusChanged =
      typeof updateData.status === "string" &&
      updateData.status !== currentOrder.status;

    const message = wasCancelled
      ? buildRefundMessage(refundResult, { adminContext: true })
      : statusChanged
        ? `Order status updated to ${String(updateData.status).replace(/_/g, " ")}.`
        : "Order updated successfully.";

    return NextResponse.json({
      message,
      order: updatedOrder,
      stripeRefunded,
      manualRefundRequired,
      refundAmount: stripeRefunded || manualRefundRequired ? refundAmount : 0,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { id } = await params;

    const query = `
      *[_type == "order" && _id == $id][0] {
        _id,
        _createdAt,
        _updatedAt,
        orderNumber,
        customerName,
        email,
        totalPrice,
        currency,
        status,
        paymentMethod,
        paymentStatus,
        orderDate,
        address,
        products[] {
          _key,
          quantity,
          weight,
          grind,
          packaging,
          product-> {
            _id,
            name,
            price,
            "image": images[0].asset->url
          }
        },
        subtotal,
        tax,
        shipping,
        amountDiscount,
        trackingNumber,
        notes,
        estimatedDelivery,
        actualDelivery,
        addressConfirmedBy,
        addressConfirmedAt,
        orderConfirmedBy,
        orderConfirmedAt,
        packedBy,
        packedAt,
        packingNotes,
        dispatchedBy,
        dispatchedAt,
        assignedWarehouseBy,
        assignedWarehouseAt,
        assignedDeliverymanId,
        assignedDeliverymanName,
        deliveredBy,
        deliveredAt,
        deliveryNotes,
        deliveryAttempts,
        rescheduledDate,
        rescheduledReason,
        cashCollected,
        cashCollectedAmount,
        cashCollectedAt,
        paymentReceivedBy,
        paymentReceivedAt,
        cancellationRequested,
        cancellationRequestedAt,
        cancellationRequestReason,
        cancelledAt,
        cancelledBy,
        cancellationReason,
        refundedToWallet,
        refundAmount,
        amountPaid
      }
    `;

    const order = await writeClient.fetch(query, { id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
