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
    <div className="flex items-center gap-1.5">
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
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
      <span className="text-xs text-light-color">vs last month</span>
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
      <div className="flex min-h-full flex-1 flex-col bg-shop_light_bg p-6">
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader>
            <CardTitle className="text-red-700">Dashboard unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              onClick={refreshAll}
              className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const periodTotals = seriesData?.totals;

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(188,108,37,0.12),_transparent_55%),linear-gradient(180deg,#faf7f2_0%,#fdfcfb_45%,#f5efe6_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/50 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1600px] flex-1 space-y-8 p-4 md:p-6 lg:p-8 xl:p-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">
              Sheba Cup Coffee
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-shop_dark_green md:text-4xl">
              Operations
            </h1>
            <p className="max-w-xl text-sm text-light-color md:text-base">
              Live catalog, orders, and revenue — at a glance.
            </p>
          </div>
          <Button
            onClick={refreshAll}
            variant="outline"
            className="border-shop_dark_green/20 bg-white/70 text-shop_dark_green hover:bg-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Link href={toLocalizedPath(stat.href)}>
                  <Card className="group border-shop_dark_green/10 bg-white/75 shadow-none backdrop-blur-sm transition hover:border-shop_light_green/40 hover:bg-white">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium tracking-wide text-light-color uppercase">
                          {stat.title}
                        </span>
                        <span className="rounded-md bg-shop_light_bg p-2 text-shop_dark_green transition group-hover:bg-brand-gold-light/40">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="font-serif text-2xl font-semibold text-shop_dark_green md:text-3xl">
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
        <Card className="border-shop_dark_green/10 bg-white/80 shadow-none backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-shop_dark_green/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-serif text-xl text-shop_dark_green">
                <TrendingUp className="h-5 w-5 text-shop_light_green" />
                Orders & revenue
              </CardTitle>
              <p className="text-sm text-light-color">
                {periodTotals
                  ? `${formatNumber(periodTotals.orders)} orders · ${formatCurrency(periodTotals.revenue)} · AOV ${formatCurrency(periodTotals.averageOrderValue)}`
                  : "Filtered trends from your order history"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 rounded-lg bg-shop_light_bg p-1">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition",
                    range === option.value
                      ? "bg-shop_dark_green text-white shadow-sm"
                      : "text-shop_dark_green/70 hover:bg-white hover:text-shop_dark_green",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 pt-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-shop_dark_green">
                  Revenue
                </h3>
                <span className="text-xs text-light-color">USD</span>
              </div>
              {chartLoading ? (
                <div className="flex h-[240px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color">
                  Loading chart…
                </div>
              ) : seriesData?.series?.length ? (
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <AreaChart
                    data={seriesData.series}
                    margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
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
                      minTickGap={28}
                      tick={{ fill: "#78716c", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={48}
                      tickFormatter={(v) =>
                        v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`
                      }
                      tick={{ fill: "#78716c", fontSize: 11 }}
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
                <div className="flex h-[240px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color">
                  No order data in this range
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-shop_dark_green">
                  Orders
                </h3>
                <span className="text-xs text-light-color">Count</span>
              </div>
              {chartLoading ? (
                <div className="flex h-[240px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color">
                  Loading chart…
                </div>
              ) : seriesData?.series?.length ? (
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart
                    data={seriesData.series}
                    margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="rgba(61,43,31,0.08)" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={28}
                      tick={{ fill: "#78716c", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={36}
                      tick={{ fill: "#78716c", fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="orders"
                      fill="#3d2b1f"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[240px] items-center justify-center rounded-xl bg-shop_light_bg/80 text-sm text-light-color">
                  No order data in this range
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending requests */}
        {accountRequests && accountRequests.totalPendingRequests > 0 && (
          <Card className="border-amber-200/80 bg-linear-to-br from-amber-50/90 to-orange-50/50 shadow-none">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
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
              <Link href={toLocalizedPath("/admin/account-requests")}>
                <Button className="bg-shop_dark_green text-white hover:bg-shop_btn_dark_green">
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.04 }}
              >
                <Link href={toLocalizedPath(link.href)}>
                  <Card className="group h-full border-shop_dark_green/10 bg-white/70 shadow-none transition hover:border-shop_light_green/35 hover:bg-white">
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="rounded-lg bg-shop_dark_green p-2.5 text-white transition group-hover:bg-shop_light_green">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
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
