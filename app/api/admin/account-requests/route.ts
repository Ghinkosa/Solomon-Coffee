import { NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/requireAdminApi";
import { writeClient } from "@/sanity/lib/client";

const USER_FIELDS = `{
  _id,
  firstName,
  lastName,
  email,
  premiumStatus,
  businessStatus,
  premiumAppliedAt,
  businessAppliedAt,
  premiumApprovedAt,
  businessApprovedAt,
  rejectionReason
}`;

export async function GET() {
  try {
    const admin = await requireAdminApi();
    if (isAdminApiError(admin)) {
      return admin;
    }

    const [
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
    ] = await Promise.all([
      writeClient.fetch(
        `*[_type in ["user", "userType"] && premiumStatus == "pending"] ${USER_FIELDS} | order(premiumAppliedAt desc)`,
      ),
      writeClient.fetch(
        `*[_type in ["user", "userType"] && businessStatus == "pending"] ${USER_FIELDS} | order(businessAppliedAt desc)`,
      ),
      writeClient.fetch(
        `*[_type in ["user", "userType"] && premiumStatus == "active"] ${USER_FIELDS} | order(premiumApprovedAt desc)`,
      ),
      writeClient.fetch(
        `*[_type in ["user", "userType"] && businessStatus == "active"] ${USER_FIELDS} | order(businessApprovedAt desc)`,
      ),
      writeClient.fetch(
        `*[_type in ["user", "userType"] && (premiumStatus != "none" || businessStatus != "none")] ${USER_FIELDS}`,
      ),
    ]);

    const response = NextResponse.json({
      success: true,
      premiumRequests,
      businessRequests,
      approvedPremiumAccounts,
      approvedBusinessAccounts,
      allUsers,
    });

    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error fetching account requests:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch account requests" },
      { status: 500 },
    );
  }
}
