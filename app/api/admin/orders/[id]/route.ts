import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { writeClient } from "@/sanity/lib/client";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { refundOrderPayment, buildRefundMessage } from "@/lib/stripeRefund";
import { restoreOrderStock } from "@/lib/stock";
import { buildTimelineFieldsForStatus } from "@/lib/orderTimelineSync";
import { invalidateOrder } from "@/lib/cache";
import { expireCheckoutSessionIfOpen } from "@/lib/expireCheckoutSession";

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
        stripeCheckoutSessionId,
        pricingLocked,
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

    // Cancelled orders are terminal — do not revive via admin PATCH.
    if (
      currentOrder.status === "cancelled" &&
      updateData.status !== undefined &&
      updateData.status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "Cancelled orders cannot be revived. Create a new order if needed.",
        },
        { status: 400 },
      );
    }

    // Never mark paid through admin PATCH — Stripe webhook / collectCash only.
    if (
      updateData.paymentStatus !== undefined &&
      updateData.paymentStatus !== currentOrder.paymentStatus &&
      updateData.paymentStatus === "paid"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot mark an order paid via admin. Use Stripe checkout or cash collection.",
        },
        { status: 400 },
      );
    }

    // Freeze money fields once a Checkout session exists or payment completed.
    if (
      updateData.totalPrice !== undefined &&
      updateData.totalPrice !== currentOrder.totalPrice
    ) {
      const priceLocked =
        currentOrder.pricingLocked === true ||
        Boolean(currentOrder.stripeCheckoutSessionId) ||
        currentOrder.paymentStatus === "paid" ||
        currentOrder.paymentStatus === "refunded";
      if (priceLocked) {
        return NextResponse.json(
          {
            error:
              "Order total is locked after checkout or payment. Cancel and recreate, or use the refund flow.",
          },
          { status: 400 },
        );
      }
    }

    if (
      updateData.paymentStatus !== undefined &&
      updateData.paymentStatus !== currentOrder.paymentStatus &&
      updateData.status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "Payment status can only change through the checkout, cash collection, or cancel/refund flows.",
        },
        { status: 400 },
      );
    }

    const forbiddenManualFields = [
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
      "stripeRefundId",
    ];
    const forbiddenField = forbiddenManualFields.find(
      (field) => updateData[field] !== undefined,
    );
    if (forbiddenField) {
      return NextResponse.json(
        {
          error: `${forbiddenField} is managed server-side and cannot be updated manually.`,
        },
        { status: 400 },
      );
    }

    const allowedFields = [
      "status",
      "totalPrice",
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
      await expireCheckoutSessionIfOpen(currentOrder.stripeCheckoutSessionId);

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
