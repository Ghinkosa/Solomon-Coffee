"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Crown,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import AccountRequestsOverview from "@/components/admin/AccountRequestsOverview";

interface UserRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  premiumStatus: string;
  businessStatus: string;
  premiumAppliedAt?: string;
  businessAppliedAt?: string;
  premiumApprovedAt?: string;
  businessApprovedAt?: string;
  rejectionReason?: string;
}

type AccountType = "premium" | "business";

type ActionDialog = {
  isOpen: boolean;
  userId: string;
  type: AccountType;
  userEmail: string;
};

type BulkDialog = {
  isOpen: boolean;
  action: "approve" | "reject";
  type: AccountType;
};

async function readApiError(response: Response) {
  try {
    const data = await response.json();
    return data.message || data.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-200 bg-amber-50 text-amber-800 shadow-none"
      >
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-800 shadow-none"
      >
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-red-200 bg-red-50 text-red-800 shadow-none"
      >
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shadow-none">
      {status}
    </Badge>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function RequestTable({
  users,
  type,
  handleApprove,
  openReject,
  actionLoading,
  selectedRequests,
  toggleRequestSelection,
  selectAllRequests,
}: {
  users: UserRequest[];
  type: AccountType;
  handleApprove: (userId: string, type: AccountType) => void;
  openReject: (user: UserRequest, type: AccountType) => void;
  actionLoading: string | null;
  selectedRequests: string[];
  toggleRequestSelection: (userId: string) => void;
  selectAllRequests: (userIds: string[]) => void;
}) {
  if (users.length === 0) {
    const Icon = type === "premium" ? Crown : Building2;
    return (
      <Card className="border-shop_dark_green/10 bg-white/80 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-14">
          <Icon className="mb-3 h-10 w-10 text-shop_dark_green/30" />
          <h3 className="font-serif text-lg text-shop_dark_green">
            No {type === "premium" ? "premium" : "business"} requests
          </h3>
          <p className="mt-1 text-sm text-shop_dark_green/60">
            Nothing waiting for review in this queue.
          </p>
        </CardContent>
      </Card>
    );
  }

  const pendingUserIds = users
    .filter((u) =>
      type === "premium"
        ? u.premiumStatus === "pending"
        : u.businessStatus === "pending",
    )
    .map((u) => u._id);
  const allPendingSelected =
    pendingUserIds.length > 0 &&
    pendingUserIds.every((id) => selectedRequests.includes(id));

  return (
    <Card className="overflow-hidden border-shop_dark_green/10 bg-white/80 shadow-none">
      <CardHeader className="border-b border-shop_dark_green/8 pb-4">
        <CardTitle className="flex items-center gap-2 font-serif text-lg text-shop_dark_green">
          {type === "premium" ? (
            <Crown className="h-5 w-5 text-brand-gold" />
          ) : (
            <Building2 className="h-5 w-5 text-shop_light_green" />
          )}
          {type === "premium" ? "Premium" : "Business"} requests
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allPendingSelected}
                    onCheckedChange={() => selectAllRequests(pendingUserIds)}
                    disabled={pendingUserIds.length === 0}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const status =
                  type === "premium" ? user.premiumStatus : user.businessStatus;
                const appliedAt =
                  type === "premium"
                    ? user.premiumAppliedAt
                    : user.businessAppliedAt;
                const busy = actionLoading === user._id;

                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(user._id)}
                        onCheckedChange={() => toggleRequestSelection(user._id)}
                        disabled={status !== "pending"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-shop_dark_green">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-sm text-shop_dark_green/60">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-shop_dark_green/70">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(appliedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          disabled={busy || status !== "pending"}
                          onClick={() => handleApprove(user._id, type)}
                          className="bg-shop_dark_green text-white hover:bg-shop_btn_dark_green"
                        >
                          {busy ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || status !== "pending"}
                          onClick={() => openReject(user, type)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {users.map((user) => {
            const status =
              type === "premium" ? user.premiumStatus : user.businessStatus;
            const appliedAt =
              type === "premium"
                ? user.premiumAppliedAt
                : user.businessAppliedAt;
            const busy = actionLoading === user._id;

            return (
              <div
                key={user._id}
                className="rounded-xl border border-shop_dark_green/10 bg-white/90 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedRequests.includes(user._id)}
                      onCheckedChange={() => toggleRequestSelection(user._id)}
                      disabled={status !== "pending"}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-shop_dark_green">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-shop_dark_green/60">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="mb-3 text-xs text-shop_dark_green/55">
                  Applied {formatDate(appliedAt)}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-shop_dark_green hover:bg-shop_btn_dark_green"
                    disabled={busy || status !== "pending"}
                    onClick={() => handleApprove(user._id, type)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700"
                    disabled={busy || status !== "pending"}
                    onClick={() => openReject(user, type)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ApprovedAccountsTable({
  premiumAccounts,
  businessAccounts,
  openCancel,
}: {
  premiumAccounts: UserRequest[];
  businessAccounts: UserRequest[];
  openCancel: (user: UserRequest, type: AccountType) => void;
}) {
  const allApprovedAccounts = [
    ...premiumAccounts.map((account) => ({
      ...account,
      accountType: "premium" as const,
    })),
    ...businessAccounts.map((account) => ({
      ...account,
      accountType: "business" as const,
    })),
  ].sort((a, b) => {
    const dateA =
      a.accountType === "premium" ? a.premiumApprovedAt : a.businessApprovedAt;
    const dateB =
      b.accountType === "premium" ? b.premiumApprovedAt : b.businessApprovedAt;
    return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
  });

  if (allApprovedAccounts.length === 0) {
    return (
      <Card className="border-shop_dark_green/10 bg-white/80 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-14">
          <CheckCircle className="mb-3 h-10 w-10 text-shop_dark_green/30" />
          <h3 className="font-serif text-lg text-shop_dark_green">
            No approved accounts
          </h3>
          <p className="mt-1 text-sm text-shop_dark_green/60">
            Approved premium and business accounts will show here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-shop_dark_green/10 bg-white/80 shadow-none">
      <CardHeader className="border-b border-shop_dark_green/8 pb-4">
        <CardTitle className="flex items-center gap-2 font-serif text-lg text-shop_dark_green">
          <CheckCircle className="h-5 w-5 text-shop_light_green" />
          Approved accounts ({allApprovedAccounts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApprovedAccounts.map((account) => {
                const approvedAt =
                  account.accountType === "premium"
                    ? account.premiumApprovedAt
                    : account.businessApprovedAt;

                return (
                  <TableRow
                    key={`${account._id}-${account.accountType}`}
                  >
                    <TableCell>
                      <div className="font-medium text-shop_dark_green">
                        {account.firstName} {account.lastName}
                      </div>
                      <div className="mt-0.5 text-sm text-shop_dark_green/60">
                        {account.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 shadow-none",
                          account.accountType === "premium"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : "border-sky-200 bg-sky-50 text-sky-800",
                        )}
                      >
                        {account.accountType === "premium" ? (
                          <Crown className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {account.accountType === "premium"
                          ? "Premium"
                          : "Business"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-shop_dark_green/70">
                      {formatDate(approvedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="active" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() =>
                          openCancel(account, account.accountType)
                        }
                      >
                        Cancel access
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {allApprovedAccounts.map((account) => {
            const approvedAt =
              account.accountType === "premium"
                ? account.premiumApprovedAt
                : account.businessApprovedAt;

            return (
              <div
                key={`${account._id}-${account.accountType}`}
                className="rounded-xl border border-shop_dark_green/10 bg-white/90 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-shop_dark_green">
                      {account.firstName} {account.lastName}
                    </p>
                    <p className="text-sm text-shop_dark_green/60">
                      {account.email}
                    </p>
                  </div>
                  <StatusBadge status="active" />
                </div>
                <p className="mb-3 text-xs text-shop_dark_green/55">
                  {account.accountType} · approved {formatDate(approvedAt)}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-red-200 text-red-700"
                  onClick={() => openCancel(account, account.accountType)}
                >
                  Cancel access
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SelectionBar({
  count,
  type,
  onApprove,
  onReject,
}: {
  count: number;
  type: AccountType;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-shop_dark_green/15 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-shop_dark_green">
        {count} {type} request{count > 1 ? "s" : ""} selected
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onApprove}
          className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Approve selected
        </Button>
        <Button size="sm" variant="destructive" onClick={onReject}>
          <XCircle className="mr-1 h-4 w-4" />
          Reject selected
        </Button>
      </div>
    </div>
  );
}

export default function AccountRequestsClient() {
  const [premiumRequests, setPremiumRequests] = useState<UserRequest[]>([]);
  const [businessRequests, setBusinessRequests] = useState<UserRequest[]>([]);
  const [approvedPremiumAccounts, setApprovedPremiumAccounts] = useState<
    UserRequest[]
  >([]);
  const [approvedBusinessAccounts, setApprovedBusinessAccounts] = useState<
    UserRequest[]
  >([]);
  const [allUsers, setAllUsers] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [rejectDialog, setRejectDialog] = useState<ActionDialog>({
    isOpen: false,
    userId: "",
    type: "premium",
    userEmail: "",
  });
  const [cancelDialog, setCancelDialog] = useState<ActionDialog>({
    isOpen: false,
    userId: "",
    type: "premium",
    userEmail: "",
  });
  const [bulkActionDialog, setBulkActionDialog] = useState<BulkDialog>({
    isOpen: false,
    action: "approve",
    type: "premium",
  });

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setFetchError(null);

      const response = await fetch(
        `/api/admin/account-requests?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = await response.json();
      setPremiumRequests(data.premiumRequests || []);
      setBusinessRequests(data.businessRequests || []);
      setApprovedPremiumAccounts(data.approvedPremiumAccounts || []);
      setApprovedBusinessAccounts(data.approvedBusinessAccounts || []);
      setAllUsers(data.allUsers || []);
      setSelectedRequests([]);
    } catch (error) {
      console.error("Error fetching requests:", error);
      const message =
        error instanceof Error ? error.message : "Failed to fetch account requests";
      setFetchError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const toggleRequestSelection = (userId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllRequests = (userIds: string[]) => {
    if (userIds.every((id) => selectedRequests.includes(id))) {
      setSelectedRequests((prev) => prev.filter((id) => !userIds.includes(id)));
    } else {
      setSelectedRequests((prev) => [
        ...prev.filter((id) => !userIds.includes(id)),
        ...userIds,
      ]);
    }
  };

  const handleApprove = async (userId: string, type: AccountType) => {
    try {
      setActionLoading(userId);
      const response = await fetch("/api/admin/approve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type }),
      });

      if (!response.ok) {
        toast.error(await readApiError(response));
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Account approved");
      await fetchRequests(true);
    } catch (error) {
      console.error("Error approving account:", error);
      toast.error("Failed to approve account");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(rejectDialog.userId);
      const response = await fetch("/api/admin/reject-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: rejectDialog.userId,
          type: rejectDialog.type,
          reason: rejectReason.trim(),
        }),
      });

      if (!response.ok) {
        toast.error(await readApiError(response));
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Account rejected");
      setRejectDialog({
        isOpen: false,
        userId: "",
        type: "premium",
        userEmail: "",
      });
      setRejectReason("");
      await fetchRequests(true);
    } catch (error) {
      console.error("Error rejecting account:", error);
      toast.error("Failed to reject account");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      setActionLoading(cancelDialog.userId);
      const response = await fetch("/api/admin/cancel-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: cancelDialog.userId,
          type: cancelDialog.type,
          reason: cancelReason.trim(),
        }),
      });

      if (!response.ok) {
        toast.error(await readApiError(response));
        return;
      }

      const data = await response.json();
      toast.success(data.message || "Account cancelled");
      setCancelDialog({
        isOpen: false,
        userId: "",
        type: "premium",
        userEmail: "",
      });
      setCancelReason("");
      await fetchRequests(true);
    } catch (error) {
      console.error("Error cancelling account:", error);
      toast.error("Failed to cancel account");
    } finally {
      setActionLoading(null);
    }
  };

  const idsForBulkType = (type: AccountType) => {
    const pool =
      type === "premium" ? premiumRequests : businessRequests;
    const poolIds = new Set(pool.map((u) => u._id));
    return selectedRequests.filter((id) => poolIds.has(id));
  };

  const handleBulkApprove = async () => {
    const userIds = idsForBulkType(bulkActionDialog.type);
    if (userIds.length === 0) return;

    try {
      setActionLoading("bulk");
      const response = await fetch("/api/admin/bulk-approve-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds,
          type: bulkActionDialog.type,
        }),
      });

      if (!response.ok) {
        toast.error(await readApiError(response));
        return;
      }

      const data = await response.json();
      toast.success(
        data.message ||
          `Approved ${userIds.length} ${bulkActionDialog.type} request(s)`,
      );
      setSelectedRequests([]);
      setBulkActionDialog({
        isOpen: false,
        action: "approve",
        type: "premium",
      });
      await fetchRequests(true);
    } catch (error) {
      console.error("Error bulk approving:", error);
      toast.error("Failed to approve accounts");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkReject = async () => {
    const userIds = idsForBulkType(bulkActionDialog.type);
    if (userIds.length === 0) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading("bulk");
      const response = await fetch("/api/admin/bulk-reject-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds,
          type: bulkActionDialog.type,
          reason: rejectReason.trim(),
        }),
      });

      if (!response.ok) {
        toast.error(await readApiError(response));
        return;
      }

      const data = await response.json();
      toast.success(
        data.message ||
          `Rejected ${userIds.length} ${bulkActionDialog.type} request(s)`,
      );
      setSelectedRequests([]);
      setRejectReason("");
      setBulkActionDialog({
        isOpen: false,
        action: "reject",
        type: "premium",
      });
      await fetchRequests(true);
    } catch (error) {
      console.error("Error bulk rejecting:", error);
      toast.error("Failed to reject accounts");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkSelectedCount = idsForBulkType(bulkActionDialog.type).length;

  const pendingPremiumRequests = allUsers.filter(
    (u) => u.premiumStatus === "pending",
  ).length;
  const pendingBusinessRequests = allUsers.filter(
    (u) => u.businessStatus === "pending",
  ).length;
  const approvedPremiumRequests = allUsers.filter(
    (u) => u.premiumStatus === "active",
  ).length;
  const approvedBusinessRequests = allUsers.filter(
    (u) => u.businessStatus === "active",
  ).length;
  const rejectedPremiumRequests = allUsers.filter(
    (u) => u.premiumStatus === "rejected",
  ).length;
  const rejectedBusinessRequests = allUsers.filter(
    (u) => u.businessStatus === "rejected",
  ).length;
  const cancelledPremiumRequests = allUsers.filter(
    (u) => u.premiumStatus === "cancelled",
  ).length;
  const cancelledBusinessRequests = allUsers.filter(
    (u) => u.businessStatus === "cancelled",
  ).length;

  const stats = {
    // Totals = pending + active + rejected + cancelled (matches card breakdown)
    totalPremiumRequests:
      pendingPremiumRequests +
      approvedPremiumRequests +
      rejectedPremiumRequests +
      cancelledPremiumRequests,
    totalBusinessRequests:
      pendingBusinessRequests +
      approvedBusinessRequests +
      rejectedBusinessRequests +
      cancelledBusinessRequests,
    pendingPremiumRequests,
    pendingBusinessRequests,
    approvedPremiumRequests,
    approvedBusinessRequests,
    rejectedPremiumRequests,
    rejectedBusinessRequests,
    cancelledPremiumRequests,
    cancelledBusinessRequests,
  };

  if (loading) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(188,108,37,0.12),_transparent_55%),linear-gradient(180deg,#faf7f2_0%,#fdfcfb_45%,#f5efe6_100%)]"
        />
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-center p-8">
          <div className="flex items-center gap-3 text-shop_dark_green">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="font-serif text-lg">Loading account requests…</span>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-gold uppercase">
              Sheba Cup Coffee
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-shop_dark_green md:text-4xl">
              Account requests
            </h1>
            <p className="max-w-xl text-sm text-light-color md:text-base">
              Review premium and business applications, then approve, reject, or
              cancel access.
            </p>
          </div>
          <Button
            onClick={() => void fetchRequests(true)}
            variant="outline"
            disabled={refreshing}
            className="border-shop_dark_green/20 bg-white/70 text-shop_dark_green hover:bg-white hover:text-shop_dark_green"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
            />
            {refreshing ? "Updating…" : "Refresh"}
          </Button>
        </div>

        {fetchError && (
          <Card className="border-red-200 bg-red-50/50 shadow-none">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-700">{fetchError}</p>
              <Button
                size="sm"
                onClick={() => void fetchRequests(true)}
                className="bg-shop_dark_green hover:bg-shop_btn_dark_green"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        <AccountRequestsOverview stats={stats} />

        <Tabs defaultValue="premium" className="space-y-5">
          <TabsList className="grid h-auto w-full max-w-3xl grid-cols-1 gap-1 bg-white/70 p-1 sm:grid-cols-3">
            <TabsTrigger
              value="premium"
              className="gap-2 data-[state=active]:bg-shop_dark_green data-[state=active]:text-white"
            >
              <Crown className="h-4 w-4" />
              Premium ({premiumRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="gap-2 data-[state=active]:bg-shop_dark_green data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4" />
              Business ({businessRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="gap-2 data-[state=active]:bg-shop_dark_green data-[state=active]:text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Approved (
              {approvedPremiumAccounts.length +
                approvedBusinessAccounts.length}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value="premium" className="space-y-4">
            <SelectionBar
              count={selectedRequests.filter((id) =>
                premiumRequests.some((r) => r._id === id),
              ).length}
              type="premium"
              onApprove={() =>
                setBulkActionDialog({
                  isOpen: true,
                  action: "approve",
                  type: "premium",
                })
              }
              onReject={() => {
                setRejectReason("");
                setBulkActionDialog({
                  isOpen: true,
                  action: "reject",
                  type: "premium",
                });
              }}
            />
            <RequestTable
              users={premiumRequests}
              type="premium"
              handleApprove={handleApprove}
              openReject={(user, accountType) => {
                setRejectReason("");
                setRejectDialog({
                  isOpen: true,
                  userId: user._id,
                  type: accountType,
                  userEmail: user.email,
                });
              }}
              actionLoading={actionLoading}
              selectedRequests={selectedRequests}
              toggleRequestSelection={toggleRequestSelection}
              selectAllRequests={selectAllRequests}
            />
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <SelectionBar
              count={selectedRequests.filter((id) =>
                businessRequests.some((r) => r._id === id),
              ).length}
              type="business"
              onApprove={() =>
                setBulkActionDialog({
                  isOpen: true,
                  action: "approve",
                  type: "business",
                })
              }
              onReject={() => {
                setRejectReason("");
                setBulkActionDialog({
                  isOpen: true,
                  action: "reject",
                  type: "business",
                });
              }}
            />
            <RequestTable
              users={businessRequests}
              type="business"
              handleApprove={handleApprove}
              openReject={(user, accountType) => {
                setRejectReason("");
                setRejectDialog({
                  isOpen: true,
                  userId: user._id,
                  type: accountType,
                  userEmail: user.email,
                });
              }}
              actionLoading={actionLoading}
              selectedRequests={selectedRequests}
              toggleRequestSelection={toggleRequestSelection}
              selectAllRequests={selectAllRequests}
            />
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <ApprovedAccountsTable
              premiumAccounts={approvedPremiumAccounts}
              businessAccounts={approvedBusinessAccounts}
              openCancel={(user, accountType) => {
                setCancelReason("");
                setCancelDialog({
                  isOpen: true,
                  userId: user._id,
                  type: accountType,
                  userEmail: user.email,
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={rejectDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialog({
              isOpen: false,
              userId: "",
              type: "premium",
              userEmail: "",
            });
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Reject {rejectDialog.type} application
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectDialog.userEmail}. This may
              be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({
                  isOpen: false,
                  userId: "",
                  type: "premium",
                  userEmail: "",
                });
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleReject()}
              disabled={
                !rejectReason.trim() || actionLoading === rejectDialog.userId
              }
            >
              {actionLoading === rejectDialog.userId
                ? "Rejecting…"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialog({
              isOpen: false,
              userId: "",
              type: "premium",
              userEmail: "",
            });
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel {cancelDialog.type} access</DialogTitle>
            <DialogDescription>
              This removes {cancelDialog.userEmail}&apos;s {cancelDialog.type}{" "}
              benefits immediately.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Cancellation reason…"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialog({
                  isOpen: false,
                  userId: "",
                  type: "premium",
                  userEmail: "",
                });
                setCancelReason("");
              }}
            >
              Keep access
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleCancel()}
              disabled={
                !cancelReason.trim() || actionLoading === cancelDialog.userId
              }
            >
              {actionLoading === cancelDialog.userId
                ? "Cancelling…"
                : "Cancel access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkActionDialog.isOpen}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setBulkActionDialog({
              isOpen: false,
              action: "approve",
              type: "premium",
            });
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkActionDialog.action === "approve" ? "Approve" : "Reject"}{" "}
              {bulkSelectedCount} application
              {bulkSelectedCount === 1 ? "" : "s"}
            </DialogTitle>
            <DialogDescription>
              {bulkActionDialog.action === "approve"
                ? `Grant ${bulkActionDialog.type} access to the selected users.`
                : `Provide one rejection reason for all selected ${bulkActionDialog.type} applications.`}
            </DialogDescription>
          </DialogHeader>
          {bulkActionDialog.action === "reject" && (
            <Textarea
              placeholder="Rejection reason…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={!!actionLoading}
              onClick={() => {
                setBulkActionDialog({
                  isOpen: false,
                  action: "approve",
                  type: "premium",
                });
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={
                bulkActionDialog.action === "approve" ? "default" : "destructive"
              }
              className={
                bulkActionDialog.action === "approve"
                  ? "bg-shop_dark_green hover:bg-shop_btn_dark_green"
                  : undefined
              }
              disabled={
                !!actionLoading ||
                (bulkActionDialog.action === "reject" && !rejectReason.trim())
              }
              onClick={() =>
                void (bulkActionDialog.action === "approve"
                  ? handleBulkApprove()
                  : handleBulkReject())
              }
            >
              {actionLoading === "bulk"
                ? bulkActionDialog.action === "approve"
                  ? "Approving…"
                  : "Rejecting…"
                : bulkActionDialog.action === "approve"
                  ? `Approve ${bulkSelectedCount}`
                  : `Reject ${bulkSelectedCount}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
