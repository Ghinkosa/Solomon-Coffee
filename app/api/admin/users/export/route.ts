import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { writeClient } from "@/sanity/lib/client";
import { csvFileResponse, formatCsvDate } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 500;
const MAX_USERS = 10000;

interface SanityUser {
  _id: string;
  clerkUserId: string;
  isActive?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  activatedAt?: string;
  activatedBy?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  isEmployee?: boolean;
  employeeRole?: string;
  employeeStatus?: string;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || searchParams.get("search") || "")
      .trim();
    const sanityOnly = searchParams.get("sanityOnly") === "true";
    const clerkOnly = searchParams.get("clerkOnly") === "true";

    const clerk = await clerkClient();

    const [clerkUsers, sanityUsers] = await Promise.all([
      (async () => {
        const collected: Awaited<
          ReturnType<typeof clerk.users.getUserList>
        >["data"] = [];
        let offset = 0;
        while (offset < MAX_USERS) {
          const page = await clerk.users.getUserList({
            limit: PAGE_SIZE,
            offset,
            query: query || undefined,
            orderBy: "-created_at",
          });
          collected.push(...page.data);
          if (page.data.length < PAGE_SIZE) break;
          offset += PAGE_SIZE;
        }
        return collected;
      })(),
      writeClient.fetch(
        `*[_type == "user"]{
          _id,
          clerkUserId,
          isActive,
          email,
          firstName,
          lastName,
          createdAt,
          activatedAt,
          activatedBy,
          loyaltyPoints,
          totalSpent,
          isEmployee,
          employeeRole,
          employeeStatus
        }`,
      ),
    ]);

    const sanityMap = new Map<string, SanityUser>(
      (sanityUsers as SanityUser[]).map((user) => [user.clerkUserId, user]),
    );

    const combined = clerkUsers.map((clerkUser) => {
      const sanityUser = sanityMap.get(clerkUser.id);
      return {
        id: clerkUser.id,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        createdAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        emailVerified:
          clerkUser.primaryEmailAddress?.verification?.status === "verified",
        banned: clerkUser.banned,
        locked: clerkUser.locked,
        isActive: sanityUser?.isActive || false,
        activatedAt: sanityUser?.activatedAt,
        activatedBy: sanityUser?.activatedBy,
        sanityId: sanityUser?._id || "",
        inSanity: Boolean(sanityUser),
        loyaltyPoints: sanityUser?.loyaltyPoints || 0,
        totalSpent: sanityUser?.totalSpent || 0,
        isEmployee: sanityUser?.isEmployee || false,
        employeeRole: sanityUser?.employeeRole || "",
        employeeStatus: sanityUser?.employeeStatus || "",
      };
    });

    const clerkIds = new Set(clerkUsers.map((u) => u.id));
    const orphans = (sanityUsers as SanityUser[])
      .filter((user) => user.clerkUserId && !clerkIds.has(user.clerkUserId))
      .map((user) => ({
        id: user.clerkUserId,
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "User",
        fullName: `${user.firstName || "Unknown"} ${user.lastName || "User"}`.trim(),
        email: user.email || "",
        createdAt: user.createdAt
          ? new Date(user.createdAt).getTime()
          : undefined,
        lastSignInAt: undefined as number | undefined,
        emailVerified: false,
        banned: false,
        locked: false,
        isActive: user.isActive || false,
        activatedAt: user.activatedAt,
        activatedBy: user.activatedBy,
        sanityId: user._id,
        inSanity: true,
        loyaltyPoints: user.loyaltyPoints || 0,
        totalSpent: user.totalSpent || 0,
        isEmployee: user.isEmployee || false,
        employeeRole: user.employeeRole || "",
        employeeStatus: user.employeeStatus || "",
      }));

    let users = [...combined, ...orphans];

    if (query) {
      const lower = query.toLowerCase();
      users = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(lower) ||
          user.lastName?.toLowerCase().includes(lower) ||
          user.email?.toLowerCase().includes(lower) ||
          user.fullName?.toLowerCase().includes(lower),
      );
    }
    if (sanityOnly) {
      users = users.filter((user) => user.inSanity);
    } else if (clerkOnly) {
      users = users.filter((user) => !user.inSanity);
    }

    const headers = [
      "Full Name",
      "First Name",
      "Last Name",
      "Email",
      "Email Verified",
      "Banned",
      "Locked",
      "Has Store Profile",
      "Profile Active",
      "Loyalty Points",
      "Total Spent",
      "Employee",
      "Employee Role",
      "Employee Status",
      "Activated At",
      "Activated By",
      "Created At",
      "Last Sign In",
      "Account ID",
      "Profile ID",
    ];

    const rows = users.map((user) => [
      user.fullName,
      user.firstName,
      user.lastName,
      user.email,
      user.emailVerified ? "yes" : "no",
      user.banned ? "yes" : "no",
      user.locked ? "yes" : "no",
      user.inSanity ? "yes" : "no",
      user.isActive ? "yes" : "no",
      user.loyaltyPoints,
      user.totalSpent,
      user.isEmployee ? "yes" : "no",
      user.employeeRole,
      user.employeeStatus,
      formatCsvDate(user.activatedAt),
      user.activatedBy || "",
      formatCsvDate(user.createdAt),
      formatCsvDate(user.lastSignInAt),
      user.id,
      user.sanityId,
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    return csvFileResponse(`users-${stamp}.csv`, headers, rows);
  } catch (error) {
    console.error("Admin users CSV export failed:", error);
    return NextResponse.json(
      { error: "Failed to export users CSV" },
      { status: 500 },
    );
  }
}
