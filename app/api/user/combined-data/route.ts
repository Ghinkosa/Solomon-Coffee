import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { getAccountDiscount } from "@/lib/checkout-pricing";
import { USER_BY_EMAIL_FILTER } from "@/lib/sanity-user";
import { isUserAdmin } from "@/lib/adminUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Combined API endpoint to fetch all user data in a single request
 * Optimized for Next.js 16 and React 19
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = clerkUser.id;
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress;

    // Fetch all data in parallel
    const [user, orders, notifications, accountProfile] = await Promise.all([
      // Get user data including employee status
      client.fetch(
        `*[_type == "user" && clerkUserId == $userId][0]{
          _id,
          email,
          role,
          isEmployee
        }`,
        { userId }
      ),
      // Get orders count
      client.fetch(`count(*[_type == "order" && userId == $userId])`, {
        userId,
      }),
      // Get unread notifications count
      client.fetch(
        `*[_type == "notification" && userId == $userId && !read] | order(_createdAt desc)[0...20]{
          _id,
          read
        }`,
        { userId }
      ),
      // Get account tier profile (premium/business) used for checkout discounts.
      email
        ? client.fetch(
            `*[${USER_BY_EMAIL_FILTER}][0]{ isBusiness, businessStatus, isActive, premiumStatus }`,
            { email }
          )
        : Promise.resolve(null),
    ]);

    const accountDiscount = getAccountDiscount(accountProfile);

    return NextResponse.json(
      {
        user: user || null,
        ordersCount: orders || 0,
        isEmployee: user?.isEmployee || false,
        isAdmin: isUserAdmin(email),
        unreadNotifications: notifications?.length || 0,
        accountDiscountRate: accountDiscount.rate,
        accountDiscountType: accountDiscount.type,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching combined user data:", error);
    return NextResponse.json(
      {
        user: null,
        ordersCount: 0,
        isEmployee: false,
        isAdmin: false,
        unreadNotifications: 0,
        accountDiscountRate: 0,
        accountDiscountType: null,
      },
      { status: 200 }
    );
  }
}
