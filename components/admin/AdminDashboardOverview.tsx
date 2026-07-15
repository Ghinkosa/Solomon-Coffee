"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  UserCheck,
  Crown,
  Building2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardOverviewSkeleton } from "@/components/admin/SkeletonLoaders";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useLocalizedPath } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

type RangeKey = "7d" | "30d" | "90d" | "12m";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChange: number | null;
  ordersChange: number | null;
  usersChange: number | null;
  productsChange: number | null;
}

interface AccountRequestsSummary {
  pendingPremiumCount: number;
  pendingBusinessCount: number;
  totalPendingRequests: number;
  recentRequests: number;
}

interface SeriesPoint {
  key: string;
  label: string;
  orders: number;
  revenue: number;
}

interface SeriesResponse {
  range: RangeKey;
  series: SeriesPoint[];
  totals: {
    orders: number;
    revenue: number;
    averageOrderValue: number;
  };
}

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#bc6c25",
  },
  orders: {
    label: "Orders",
    color: "#3d2b1f",
  },
} satisfies ChartConfig;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null || change === undefined) return null;
  const positive = change >= 0;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5 shrink-0 text-red-600" />
      )}
      <span
        className={cn(
          "text-xs font-medium",
          positive ? "text-emerald-700" : "text-red-700",
        )}
      >
        {positive ? "+" : ""}
        {change}%
      </span>
      <span className="hidden text-xs text-light-color sm:inline">
        vs last month
      </span>
    </div>
  );
}

const AdminDashboardOverview = () => {
  const toLocalizedPath = useLocalizedPath();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accountRequests, setAccountRequests] =
    useState<AccountRequestsSummary | null>(null);
  const [seriesData, setSeriesData] = useState<SeriesResponse | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setError(null);
      const [statsResponse, requestsResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/account-requests-summary"),
      ]);

      if (!statsResponse.ok || !requestsResponse.ok) {
        throw new Error("Failed to load dashboard totals");
      }

      const [statsJson, requestsJson] = await Promise.all([
        statsResponse.json(),
        requestsResponse.json(),
      ]);

      if (statsJson.error || requestsJson.error) {
        throw new Error(statsJson.error || requestsJson.error);
      }

      setStats(statsJson);
      setAccountRequests(requestsJson);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeries = useCallback(async (selectedRange: RangeKey) => {
    try {
      setChartLoading(true);
      const response = await fetch(
        `/api/admin/dashboard-series?range=${selectedRange}`,
      );
      if (!response.ok) throw new Error("Failed to load chart data");
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setSeriesData(data as SeriesResponse);
    } catch (err) {
      console.error("Error fetching series:", err);
      setSeriesData(null);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchSeries(range);
  }, [range, fetchSeries]);

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchOverview(), fetchSeries(range)]);
  };

  const statCards = useMemo(
    () => [
      {
        title: "Revenue",
        value: stats?.totalRevenue || 0,
        change: stats?.revenueChange ?? null,
        icon: DollarSign,
        format: "currency" as const,
        href: "/admin/orders",
      },
      {
        title: "Orders",
        value: stats?.totalOrders || 0,
        change: stats?.ordersChange ?? null,
        icon: ShoppingCart,
        format: "number" as const,
        href: "/admin/orders",
      },
      {
        title: "Customers",
        value: stats?.totalUsers || 0,
        change: stats?.usersChange ?? null,
        icon: Users,
        format: "number" as const,
        href: "/admin/users",
      },
      {
        title: "Products",
        value: stats?.totalProducts || 0,
        change: stats?.productsChange ?? null,
        icon: Package,
        format: "number" as const,
        href: "/admin/products",
      },
    ],
    [stats],
  );

  const quickLinks = [
    {
      title: "Orders",
      description: "Confirm, pack, refund",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      description: "Catalog & stock",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Customers",
      description: "Accounts & access",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Requests",
      description:
        (accountRequests?.totalPendingRequests || 0) > 0
          ? `${accountRequests?.totalPendingRequests} pending`
          : "Premium & business",
      href: "/admin/account-requests",
      icon: UserCheck,
      badge: accountRequests?.totalPendingRequests || 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-shop_light_bg p-4 md:p-6 lg:p-8">
        <DashboardOverviewSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-shop_light_bg p-4 sm:p-6">
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader>
            <CardTitle className="text-red-700">Dashboard unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              onClick={refreshAll}
              className="w-full bg-shop_dark_green hover:bg-shop_btn_dark_green sm:w-auto"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const periodTotals = seriesData?.totals;
  const chartBoxClass =
    "!aspect-auto h-[200px] w-full min-w-0 sm:h-[240px] [&_.recharts-responsive-container]:min-h-0";

  return (
    <div className="relative flex min-h-full min-w-0 flex-1 flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(188,108,37,0.12),_transparent_55%),linear-gradient(180deg,#faf7f2_0%,#fdfcfb_45%,#f5efe6_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/50 to-transparent"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-[1600px] flex-1 space-y-6 p-3 pb-8 sm:space-y-8 sm:p-4 md:p-6 lg:p-8 xl:p-10">
        <AdminPageHeader
          title="Operations"
          description="Live catalog, orders, and revenue — at a glance."
          actions={
            <Button onClick={refreshAll} variant="outline">
              <RefreshCw className="me-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                className="min-w-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Link href={toLocalizedPath(stat.href)} className="block h-full">
                  <Card className="group h-full border-shop_dark_green/10 bg-white/75 shadow-none backdrop-blur-sm transition hover:border-shop_light_green/40 hover:bg-white">
                    <CardContent className="space-y-2 p-3 sm:space-y-3 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[10px] font-medium tracking-wide text-light-color uppercase sm:text-xs">
                          {stat.title}
                        </span>
                        <span className="shrink-0 rounded-md bg-shop_light_bg p-1.5 text-shop_dark_green transition group-hover:bg-brand-gold-light/40 sm:p-2">
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                      </div>
                      <div className="truncate font-serif text-lg font-semibold text-shop_dark_green sm:text-2xl md:text-3xl">
                        {stat.format === "currency"
                          ? formatCurrency(stat.value)
                          : formatNumber(stat.value)}
                      </div>
                      <ChangeBadge change={stat.change} />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <Card className="min-w-0 overflow-hidden border-shop_dark_green/10 bg-white/80 shadow-none backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-3 space-y-0 border-b border-shop_dark_green/8 p-4 pb-4 sm:gap-4 sm:p-6 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="flex items-center gap-2 font-serif text-lg text-shop_dark_green sm:text-xl">
                <TrendingUp className="h-5 w-5 shrink-0 text-shop_light_green" />
                Orders & revenue
              </CardTitle>
              {periodTotals ? (
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-light-color sm:text-sm">
                  <span>{formatNumber(periodTotals.orders)} orders</span>
                  <span className="text-shop_dark_green/30">·</span>
                  <span>{formatCurrency(periodTotals.revenue)}</span>
                  <span className="text-shop_dark_green/30">·</span>
                  <span>AOV {formatCurrency(periodTotals.averageOrderValue)}</span>
                </div>
              ) : (
                <p className="text-sm text-light-color">
                  Filtered trends from your order history
                </p>
              )}
            </div>
            <div className="-mx-1 overflow-x-auto px-1">
              <div className="inline-flex min-w-full gap-1 rounded-lg bg-shop_light_bg p-1 sm:min-w-0 sm:flex-wrap">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={cn(
                      "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition",
                      range === option.value
                        ? "bg-shop_dark_green text-white shadow-sm"
                        : "text-shop_dark_green/70 hover:bg-white hover:text-shop_dark_green",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-6 p-4 pt-5 sm:gap-8 sm:p-6 sm:pt-6 lg:grid-cols-2">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-shop_dark_green">
                  Revenue
                </h3>
                <span className="text-xs text-light-color">USD</span>
              </div>
              {chartLoading ? (
                <div className="flex h-[200px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color sm:h-[240px]">
                  Loading chart…
                </div>
              ) : seriesData?.series?.length ? (
                <ChartContainer config={chartConfig} className={chartBoxClass}>
                  <AreaChart
                    data={seriesData.series}
                    margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillDashRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bc6c25" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#bc6c25" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(61,43,31,0.08)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={20}
                      interval="preserveStartEnd"
                      tick={{ fill: "#78716c", fontSize: 10 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      width={40}
                      tickFormatter={(v) =>
                        v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                      }
                      tick={{ fill: "#78716c", fontSize: 10 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            formatCurrency(Number(value) || 0)
                          }
                        />
                      }
                    />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      stroke="#bc6c25"
                      strokeWidth={2}
                      fill="url(#fillDashRevenue)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color sm:h-[240px]">
                  No order data in this range
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-shop_dark_green">
                  Orders
                </h3>
                <span className="text-xs text-light-color">Count</span>
              </div>
              {chartLoading ? (
                <div className="flex h-[200px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color sm:h-[240px]">
                  Loading chart…
                </div>
              ) : seriesData?.series?.length ? (
                <ChartContainer config={chartConfig} className={chartBoxClass}>
                  <BarChart
                    data={seriesData.series}
                    margin={{ left: 0, right: 4, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(61,43,31,0.08)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={20}
                      interval="preserveStartEnd"
                      tick={{ fill: "#78716c", fontSize: 10 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      width={28}
                      tick={{ fill: "#78716c", fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="orders"
                      fill="#3d2b1f"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color sm:h-[240px]">
                  No order data in this range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending requests */}
        {accountRequests && accountRequests.totalPendingRequests > 0 && (
          <Card className="border-amber-200/80 bg-linear-to-br from-amber-50/90 to-orange-50/50 shadow-none">
            <CardContent className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-semibold text-amber-900">
                  Pending account requests
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-amber-800/90">
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    {accountRequests.pendingPremiumCount} premium
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {accountRequests.pendingBusinessCount} business
                  </span>
                  <span className="text-amber-700/80">
                    {accountRequests.recentRequests} this week
                  </span>
                </div>
              </div>
              <Link
                href={toLocalizedPath("/admin/account-requests")}
                className="w-full md:w-auto"
              >
                <Button className="w-full bg-shop_dark_green text-white hover:bg-shop_btn_dark_green md:w-auto">
                  Review requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.title}
                className="min-w-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.04 }}
              >
                <Link href={toLocalizedPath(link.href)} className="block h-full">
                  <Card className="group h-full border-shop_dark_green/10 bg-white/70 shadow-none transition hover:border-shop_light_green/35 hover:bg-white">
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="shrink-0 rounded-lg bg-shop_dark_green p-2.5 text-white transition group-hover:bg-shop_light_green">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-shop_dark_green">
                            {link.title}
                          </p>
                          {link.badge && link.badge > 0 ? (
                            <Badge className="bg-shop_light_green text-white hover:bg-shop_light_green">
                              {link.badge}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-light-color">
                          {link.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
