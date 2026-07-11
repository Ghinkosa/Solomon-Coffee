import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  getUserAddressesByEmail,
  getUserOrdersByEmail,
} from "@/sanity/queries/emailUserQueries";

export async function GET() {
  try {
    // Check authentication and use the session's own email — a client must not
    // be able to request another user's addresses/orders by passing an email.
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Fetch user data from Sanity
    const [addresses, orders] = await Promise.all([
      getUserAddressesByEmail(email),
      getUserOrdersByEmail(email),
    ]);

    return NextResponse.json({
      addresses,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
