import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/adminUtils";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// Disable Next.js caching for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const sortBy = searchParams.get("sortBy") || "orderDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const allowedSortFields = new Set([
      "orderDate",
      "_createdAt",
      "totalPrice",
      "status",
    ]);
    const sortField = allowedSortFields.has(sortBy) ? sortBy : "orderDate";
    const sortDir = sortOrder === "asc" ? "asc" : "desc";

    const filters = [`_type == "order"`];
    const params: Record<string, unknown> = {
      offset,
      limitEnd: offset + limit,
    };

    if (status) {
      filters.push(`status == $status`);
      params.status = status;
    }
    if (paymentMethod) {
      filters.push(`paymentMethod == $paymentMethod`);
      params.paymentMethod = paymentMethod;
    }

    const filterClause = filters.join(" && ");
    const query = `
      *[${filterClause}] | order(${sortField} ${sortDir}) [$offset...$limitEnd] {
        _id,
        _createdAt,
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
        cancellationRequested,
        cancellationRequestedAt,
        cancellationRequestReason
      }
    `;

    const countQuery = `count(*[${filterClause}])`;

    const [orders, totalCount] = await Promise.all([
      client.fetch(query, params, { cache: "no-store", next: { revalidate: 0 } }),
      client.fetch(countQuery, params, {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
    ]);

    return NextResponse.json(
      {
        orders,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        pagination: {
          limit,
          offset,
          total: totalCount,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete orders (single or bulk)
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
    const { orderIds } = body; // Array of order IDs to delete

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Order IDs array is required" },
        { status: 400 }
      );
    }

    // Delete orders from Sanity
    const deleteResults = [];
    for (const orderIdToDelete of orderIds) {
      try {
        await writeClient.delete(orderIdToDelete);
        deleteResults.push({ orderId: orderIdToDelete, success: true });
      } catch (error) {
        console.error(`Failed to delete order ${orderIdToDelete}:`, error);
        deleteResults.push({
          orderId: orderIdToDelete,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = deleteResults.filter((r) => r.success).length;
    const failureCount = deleteResults.filter((r) => !r.success).length;

    // Revalidate admin orders page to clear cache
    if (successCount > 0) {
      try {
        revalidatePath("/admin/orders", "page");
        revalidatePath("/api/admin/orders", "page");
      } catch (revalidateError) {
        console.error("Error revalidating paths:", revalidateError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${successCount} order(s)${
          failureCount > 0 ? `, failed to delete ${failureCount}` : ""
        }`,
        results: deleteResults,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error deleting orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
