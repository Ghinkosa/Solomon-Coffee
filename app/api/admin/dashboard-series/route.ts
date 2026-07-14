import { NextRequest, NextResponse } from "next/server";
import { readClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type RangeKey = "7d" | "30d" | "90d" | "12m";

type OrderPoint = {
  orderDate?: string;
  _createdAt?: string;
  totalPrice?: number;
  status?: string;
};

type SeriesPoint = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

const RANGE_CONFIG: Record<
  RangeKey,
  { days?: number; months?: number; bucket: "day" | "week" | "month" }
> = {
  "7d": { days: 7, bucket: "day" },
  "30d": { days: 30, bucket: "day" },
  "90d": { days: 90, bucket: "week" },
  "12m": { months: 12, bucket: "month" },
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-based
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekLabel(date: Date) {
  return `Week of ${formatDayLabel(date)}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function bucketKey(date: Date, bucket: "day" | "week" | "month") {
  if (bucket === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (bucket === "week") {
    const week = startOfWeek(date);
    return week.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function buildEmptyBuckets(
  from: Date,
  to: Date,
  bucket: "day" | "week" | "month",
): Map<string, SeriesPoint> {
  const map = new Map<string, SeriesPoint>();
  const cursor = new Date(
    bucket === "month"
      ? startOfMonth(from)
      : bucket === "week"
        ? startOfWeek(from)
        : startOfDay(from),
  );
  const end = new Date(to);

  while (cursor <= end) {
    const key = bucketKey(cursor, bucket);
    const label =
      bucket === "month"
        ? formatMonthLabel(cursor)
        : bucket === "week"
          ? formatWeekLabel(cursor)
          : formatDayLabel(cursor);
    map.set(key, { key, label, orders: 0, revenue: 0 });

    if (bucket === "month") {
      cursor.setMonth(cursor.getMonth() + 1);
    } else if (bucket === "week") {
      cursor.setDate(cursor.getDate() + 7);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return map;
}

function isCountableOrder(order: OrderPoint) {
  return order.status !== "cancelled";
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const rangeParam = (req.nextUrl.searchParams.get("range") ||
      "30d") as RangeKey;
    const range: RangeKey = RANGE_CONFIG[rangeParam] ? rangeParam : "30d";
    const config = RANGE_CONFIG[range];

    const now = new Date();
    const from = new Date(now);
    if (config.months) {
      from.setMonth(from.getMonth() - (config.months - 1));
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(from.getDate() - ((config.days || 30) - 1));
      from.setHours(0, 0, 0, 0);
    }

    const orders = (await readClient.fetch(
      `*[_type == "order" && dateTime(coalesce(orderDate, _createdAt)) >= dateTime($from)]{
        orderDate,
        _createdAt,
        totalPrice,
        status
      }`,
      { from: from.toISOString() },
      { cache: "no-store" },
    )) as OrderPoint[];

    const buckets = buildEmptyBuckets(from, now, config.bucket);

    for (const order of orders || []) {
      if (!isCountableOrder(order)) continue;
      const raw = order.orderDate || order._createdAt;
      if (!raw) continue;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime()) || date < from) continue;

      const key = bucketKey(date, config.bucket);
      const point = buckets.get(key);
      if (!point) continue;

      point.orders += 1;
      point.revenue += Number(order.totalPrice) || 0;
    }

    const series = Array.from(buckets.values()).map((point) => ({
      ...point,
      revenue: Number(point.revenue.toFixed(2)),
    }));

    const totalOrders = series.reduce((sum, p) => sum + p.orders, 0);
    const totalRevenue = series.reduce((sum, p) => sum + p.revenue, 0);

    return NextResponse.json({
      range,
      series,
      totals: {
        orders: totalOrders,
        revenue: Number(totalRevenue.toFixed(2)),
        averageOrderValue:
          totalOrders > 0
            ? Number((totalRevenue / totalOrders).toFixed(2))
            : 0,
      },
    });
  } catch (error) {
    console.error("Dashboard series fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard series" },
      { status: 500 },
    );
  }
}
