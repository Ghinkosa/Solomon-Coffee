import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { calculatePointsUpdate } from "@/lib/pointsCalculation";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Never trust a client-supplied order total. Load the order, confirm it
    // belongs to the caller and is actually paid, and use its persisted amount.
    const order = await backendClient.fetch<{
      _id: string;
      _rev: string;
      clerkUserId?: string;
      paymentStatus?: string;
      pointsAwarded?: boolean;
      amountPaid?: number;
      totalPrice?: number;
      user?: { clerkUserId?: string };
    } | null>(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        _rev,
        clerkUserId,
        paymentStatus,
        pointsAwarded,
        amountPaid,
        totalPrice,
        user->{ clerkUserId }
      }`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderOwner = order.clerkUserId || order.user?.clerkUserId;
    if (orderOwner !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Points are only awarded for paid orders" },
        { status: 400 }
      );
    }

    // Idempotency: award points for a given order at most once.
    if (order.pointsAwarded) {
      return NextResponse.json({
        success: true,
        alreadyAwarded: true,
        pointsEarned: { rewardPoints: 0, loyaltyPoints: 0 },
        messages: [],
      });
    }

    const orderTotal = order.amountPaid ?? order.totalPrice ?? 0;

    // Get user from Sanity
    const sanityUser = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id,
        rewardPoints,
        loyaltyPoints,
        totalSpent,
        "completedOrders": count(*[_type == "order" && user._ref == ^._id && status == "completed"])
      }`,
      { clerkUserId: userId }
    );

    if (!sanityUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate points update
    const pointsUpdate = calculatePointsUpdate(
      orderTotal,
      sanityUser.completedOrders || 0,
      sanityUser.rewardPoints || 0,
      sanityUser.loyaltyPoints || 0
    );

    // Mark the order as awarded first (idempotency guard), revision-locked so two
    // concurrent requests can't both credit points for the same order.
    try {
      await backendClient
        .patch(order._id)
        .ifRevisionId(order._rev)
        .set({ pointsAwarded: true })
        .commit();
    } catch {
      return NextResponse.json({
        success: true,
        alreadyAwarded: true,
        pointsEarned: { rewardPoints: 0, loyaltyPoints: 0 },
        messages: [],
      });
    }

    // Update user points and total spent
    const updatedUser = await backendClient
      .patch(sanityUser._id)
      .set({
        rewardPoints: pointsUpdate.rewardPoints,
        loyaltyPoints: pointsUpdate.loyaltyPoints,
        totalSpent: (sanityUser.totalSpent || 0) + orderTotal,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({
      success: true,
      user: updatedUser,
      pointsEarned: {
        rewardPoints:
          pointsUpdate.rewardPoints - (sanityUser.rewardPoints || 0),
        loyaltyPoints:
          pointsUpdate.loyaltyPoints - (sanityUser.loyaltyPoints || 0),
      },
      messages: pointsUpdate.message,
    });
  } catch (error) {
    console.error("Error updating user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user points and stats
    const userStats = await backendClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id,
        rewardPoints,
        loyaltyPoints,
        totalSpent,
        lastLogin,
        "completedOrders": count(*[_type == "order" && user._ref == ^._id && status == "completed"]),
        "pendingOrders": count(*[_type == "order" && user._ref == ^._id && status in ["pending", "processing"]]),
        "totalOrders": count(*[_type == "order" && user._ref == ^._id])
      }`,
      { clerkUserId: userId }
    );

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      stats: userStats,
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
