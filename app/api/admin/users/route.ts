import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";
import { writeClient } from "@/sanity/lib/client";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !isUserAdmin(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("query") || "";

    // Fetch users from Clerk
    const usersResponse = await clerk.users.getUserList({
      limit,
      offset,
      query: query || undefined,
      orderBy: "-created_at",
    });

    // Format user data
    const formattedUsers = usersResponse.data.map((user: User) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      emailVerified:
        user.primaryEmailAddress?.verification?.status === "verified",
      banned: user.banned,
      locked: user.locked,
      twoFactorEnabled: user.twoFactorEnabled,
      privateMetadata: user.privateMetadata,
      publicMetadata: user.publicMetadata,
      externalId: user.externalId,
    }));

    return NextResponse.json({
      users: formattedUsers,
      totalCount: usersResponse.totalCount,
      hasNextPage: offset + limit < (usersResponse.totalCount || 0),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete users (single or bulk)
export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }

    // Get current user details to check admin status
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const userEmail = currentUser.primaryEmailAddress?.emailAddress;

    // Check if current user is admin
    if (!userEmail || !isUserAdmin(userEmail)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userIds } = body; // Array of user IDs to delete

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(userId)) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Delete users from both Clerk and Sanity
    const deleteResults = [];
    for (const userIdToDelete of userIds) {
      const result: {
        userId: string;
        clerkDeleted: boolean;
        sanityDeleted: boolean;
        sanityDataDeleted?: {
          addresses: number;
          orders: number;
          reviews: number;
        };
        error?: string;
      } = {
        userId: userIdToDelete,
        clerkDeleted: false,
        sanityDeleted: false,
      };

      // Try to delete from Clerk (might not exist)
      try {
        await clerk.users.deleteUser(userIdToDelete);
        result.clerkDeleted = true;
      } catch (error: any) {
        if (error?.status === 404) {
          // User doesn't exist in Clerk, that's okay
          console.log(`User ${userIdToDelete} not found in Clerk, skipping`);
        } else {
          console.error(
            `Failed to delete user ${userIdToDelete} from Clerk:`,
            error
          );
          result.error =
            error instanceof Error ? error.message : "Unknown error";
        }
      }

      // Try to delete from Sanity (and all related data)
      try {
        const existingUser = await writeClient.fetch(
          `*[_type == "user" && clerkUserId == $clerkUserId][0]{_id, email}`,
          { clerkUserId: userIdToDelete }
        );

        if (existingUser) {
          // Get all related data including references
          const relatedData = await writeClient.fetch(
            `{
              "addresses": *[_type == "address" && (email == $email || user._ref == $sanityId)]._id,
              "orders": *[_type == "order" && clerkUserId == $clerkUserId]._id,
              "reviews": *[_type == "review" && user._ref == $sanityId]._id,
              "userAddresses": *[_type == "user" && _id == $sanityId][0].addresses[]._ref
            }`,
            {
              email: existingUser.email,
              clerkUserId: userIdToDelete,
              sanityId: existingUser._id,
            }
          );

          // Create transaction to delete everything
          const transaction = writeClient.transaction();

          // First, remove references from user document (addresses array, orders array, wishlist, cart, etc.)
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

          result.sanityDeleted = true;
          result.sanityDataDeleted = {
            addresses: relatedData.addresses.length,
            orders: relatedData.orders.length,
            reviews: relatedData.reviews.length,
          };
        }
      } catch (error) {
        console.error(
          `Failed to delete user ${userIdToDelete} from Sanity:`,
          error
        );
        result.error = result.error
          ? `${result.error}; Sanity: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          : `Sanity: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
      }

      deleteResults.push(result);
    }

    const successCount = deleteResults.filter(
      (r) => r.clerkDeleted || r.sanityDeleted
    ).length;
    const totalDeleted = {
      clerk: deleteResults.filter((r) => r.clerkDeleted).length,
      sanity: deleteResults.filter((r) => r.sanityDeleted).length,
    };

    return NextResponse.json({
      success: true,
      message: `Deleted ${totalDeleted.clerk} user(s) from Clerk and ${totalDeleted.sanity} user(s) from Sanity`,
      totalProcessed: userIds.length,
      successCount,
      results: deleteResults,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
