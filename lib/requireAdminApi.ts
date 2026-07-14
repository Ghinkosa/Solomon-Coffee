import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/adminGate";

export type AdminApiContext = {
  userId: string;
  email: string;
};

export async function requireAdminApi(): Promise<AdminApiContext | NextResponse> {
  const { userId } = await auth();
  const gate = await resolveAdminAccess(userId);

  if (gate.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (gate.status === "denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (gate.status === "unavailable") {
    return NextResponse.json(
      {
        error: "Auth service temporarily unavailable",
        message: "Could not verify admin access. Please retry.",
      },
      { status: 503 },
    );
  }

  return { userId: gate.userId, email: gate.email };
}

export function isAdminApiError(
  result: AdminApiContext | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
