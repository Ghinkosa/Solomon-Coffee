import { NextResponse } from "next/server";
import { blockDebugInProduction } from "@/lib/debug-route-guard";

export async function GET() {
  const blocked = blockDebugInProduction();
  if (blocked) return blocked;

  return NextResponse.json({ message: "Create user debug endpoint" });
}
