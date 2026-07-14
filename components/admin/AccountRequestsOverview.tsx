"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from "lucide-react";

interface AccountRequestsOverviewProps {
  stats: {
    totalPremiumRequests: number;
    totalBusinessRequests: number;
    pendingPremiumRequests: number;
    pendingBusinessRequests: number;
    approvedPremiumRequests: number;
    approvedBusinessRequests: number;
    rejectedPremiumRequests: number;
    rejectedBusinessRequests: number;
    cancelledPremiumRequests: number;
    cancelledBusinessRequests: number;
  };
}

function StatPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "pending" | "approved" | "rejected" | "cancelled";
  icon: typeof Clock;
}) {
  const tones = {
    pending: "bg-amber-50 text-amber-800 border-amber-200/80",
    approved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    rejected: "bg-red-50 text-red-800 border-red-200/80",
    cancelled: "bg-slate-100 text-slate-700 border-slate-200/80",
  };

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-shop_dark_green/65">{label}</span>
      <Badge
        variant="outline"
        className={`gap-1 border font-medium shadow-none ${tones[tone]}`}
      >
        <Icon className="h-3 w-3" />
        {value}
      </Badge>
    </div>
  );
}

export default function AccountRequestsOverview({
  stats,
}: AccountRequestsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <Card className="border-shop_dark_green/10 bg-white/75 shadow-none backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-light-color uppercase">
              Premium
            </span>
            <span className="rounded-md bg-shop_light_bg p-2 text-shop_dark_green">
              <Crown className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-shop_dark_green md:text-3xl">
              {stats.totalPremiumRequests}
            </div>
            <p className="mt-0.5 text-xs text-shop_dark_green/50">
              All premium statuses
            </p>
          </div>
          <div className="space-y-2">
            <StatPill
              label="Pending"
              value={stats.pendingPremiumRequests}
              tone="pending"
              icon={Clock}
            />
            <StatPill
              label="Approved"
              value={stats.approvedPremiumRequests}
              tone="approved"
              icon={CheckCircle}
            />
            <StatPill
              label="Rejected"
              value={stats.rejectedPremiumRequests}
              tone="rejected"
              icon={XCircle}
            />
            <StatPill
              label="Cancelled"
              value={stats.cancelledPremiumRequests}
              tone="cancelled"
              icon={Ban}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-shop_dark_green/10 bg-white/75 shadow-none backdrop-blur-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-light-color uppercase">
              Business
            </span>
            <span className="rounded-md bg-shop_light_bg p-2 text-shop_dark_green">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="font-serif text-2xl font-semibold text-shop_dark_green md:text-3xl">
              {stats.totalBusinessRequests}
            </div>
            <p className="mt-0.5 text-xs text-shop_dark_green/50">
              All business statuses
            </p>
          </div>
          <div className="space-y-2">
            <StatPill
              label="Pending"
              value={stats.pendingBusinessRequests}
              tone="pending"
              icon={Clock}
            />
            <StatPill
              label="Approved"
              value={stats.approvedBusinessRequests}
              tone="approved"
              icon={CheckCircle}
            />
            <StatPill
              label="Rejected"
              value={stats.rejectedBusinessRequests}
              tone="rejected"
              icon={XCircle}
            />
            <StatPill
              label="Cancelled"
              value={stats.cancelledBusinessRequests}
              tone="cancelled"
              icon={Ban}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-shop_dark_green/10 bg-white/75 shadow-none backdrop-blur-sm sm:col-span-2 xl:col-span-1">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-light-color uppercase">
              Awaiting review
            </span>
            <span className="rounded-md bg-brand-gold-light/40 p-2 text-shop_dark_green">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="font-serif text-2xl font-semibold text-shop_dark_green md:text-3xl">
            {stats.pendingPremiumRequests + stats.pendingBusinessRequests}
          </div>
          <p className="text-sm text-shop_dark_green/65">
            Premium and business applications waiting for a decision.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
