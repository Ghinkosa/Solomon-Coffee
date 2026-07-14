import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getUserByClerkId,
  getUserOrders,
  getUserWishlist,
  getUserNotifications,
} from "@/sanity/queries/userQueries";

// Returns a downloadable JSON copy of the authenticated caller's own data.
// Only ever exposes data belonging to the signed-in user.
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile, orders, wishlist, notifications] = await Promise.all([
      getUserByClerkId(user.id),
      getUserOrders(user.id),
      getUserWishlist(user.id),
      getUserNotifications(user.id),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
      },
      profile: profile ?? null,
      orders: orders ?? [],
      wishlist: wishlist ?? [],
      notifications: notifications ?? [],
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="user-data.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
