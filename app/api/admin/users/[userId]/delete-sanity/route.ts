import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";
import { writeClient } from "@/sanity/lib/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Get authenticated user
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(currentUserId);
    const adminEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!adminEmail || !isUserAdmin(adminEmail)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { userId: targetUserId } = await params;

    // Get target user from Clerk
    let targetUser;
    try {
      targetUser = await clerk.users.getUser(targetUserId);
    } catch (error) {
      // User may not exist in Clerk, continue with Sanity deletion
      console.log("User not found in Clerk, continuing with Sanity deletion");
    }

    // Check if user exists in Sanity
    const existingUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{_id, clerkUserId, email, firstName, lastName}`,
      { clerkUserId: targetUserId }
    );

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found in Sanity" },
        { status: 404 }
      );
    }

    // Get all related data for this user
    const relatedData = await writeClient.fetch(
      `{
        "addresses": *[_type == "address" && (email == $email || user._ref == $sanityId)]._id,
        "orders": *[_type == "order" && clerkUserId == $clerkUserId]._id,
        "reviews": *[_type == "review" && user._ref == $sanityId]._id
      }`,
      {
        email: existingUser.email,
        clerkUserId: targetUserId,
        sanityId: existingUser._id,
      }
    );

    // Create a transaction to delete all related data
    const transaction = writeClient.transaction();

    // First, remove all references from user document to prevent reference errors
    transaction.patch(existingUser._id, (patch) =>
      patch
        .set({ addresses: [] })
        .set({ orders: [] })
        .set({ wishlist: [] })
        .set({ cart: [] })
    );

    // Delete all addresses
    relatedData.addresses.forEach((addressId: string) => {
      transaction.delete(addressId);
    });

    // Delete all orders
    relatedData.orders.forEach((orderId: string) => {
      transaction.delete(orderId);
    });

    // Delete all reviews
    relatedData.reviews.forEach((reviewId: string) => {
      transaction.delete(reviewId);
    });

    // Finally, delete the user
    transaction.delete(existingUser._id);

    // Commit the transaction
    await transaction.commit();

    const deletedCount = {
      addresses: relatedData.addresses.length,
      orders: relatedData.orders.length,
      reviews: relatedData.reviews.length,
    };

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.firstName} ${existingUser.lastName} and all related data have been deleted from Sanity`,
      user: {
        id: targetUserId,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        deleted: true,
      },
      deletedData: deletedCount,
    });
  } catch (error) {
    console.error("Error deleting user from Sanity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
