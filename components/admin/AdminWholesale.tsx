"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Store,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { safeApiCall, handleApiError } from "./apiHelpers";

type WholesaleStatus = "new" | "contacted" | "qualified" | "closed";

type WholesaleInquiry = {
  _id: string;
  name?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  businessType?: string;
  estimatedOrderQuantity?: string;
  message?: string;
  status?: WholesaleStatus;
  submittedAt?: string;
  _createdAt?: string;
};

type Counts = Record<string, number>;

const STATUS_OPTIONS: { value: WholesaleStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
];

function statusBadge(status?: string) {
  const tones: Record<string, string> = {
    new: "border-amber-200 bg-amber-50 text-amber-800",
    contacted: "border-sky-200 bg-sky-50 text-sky-800",
    qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
    closed: "border-slate-200 bg-slate-100 text-slate-700",
  };
  return (
    <Badge
      variant="outline"
      className={cn("capitalize shadow-none", tones[status || ""] || "")}
    >
      {status || "—"}
    </Badge>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AdminWholesale() {
  const [inquiries, setInquiries] = useState<WholesaleInquiry[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WholesaleStatus | "all">(
    "all",
  );
  const [selected, setSelected] = useState<WholesaleInquiry | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await safeApiCall(
        `/api/admin/wholesale?${params.toString()}`,
      );
      setInquiries(data.inquiries || []);
      setCounts(data.counts || {});
    } catch (error) {
      handleApiError(error, "Wholesale fetch");
      toast.error("Failed to load wholesale inquiries");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (inquiryId: string, status: WholesaleStatus) => {
    setSavingStatus(true);
    try {
      const data = await safeApiCall("/api/admin/wholesale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status }),
      });
      setInquiries((prev) =>
        prev.map((item) => (item._id === inquiryId ? data.inquiry : item)),
      );
      if (selected?._id === inquiryId) setSelected(data.inquiry);
      toast.success("Status updated");
      void fetchInquiries();
    } catch (error) {
      handleApiError(error, "Wholesale status");
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async (item: WholesaleInquiry) => {
    if (!window.confirm(`Delete inquiry from ${item.name || item.email}?`)) {
      return;
    }
    setDeletingId(item._id);
    try {
      await safeApiCall(`/api/admin/wholesale?id=${item._id}`, {
        method: "DELETE",
      });
      toast.success("Inquiry deleted");
      if (selected?._id === item._id) setSelected(null);
      await fetchInquiries();
    } catch (error) {
      handleApiError(error, "Wholesale delete");
      toast.error(
        error instanceof Error ? error.message : "Failed to delete inquiry",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Wholesale"
        description="Review cafe and retailer inquiries submitted from the site."
        actions={
          <Button
            variant="outline"
            onClick={() => void fetchInquiries()}
            disabled={loading}
          >
            <RefreshCw
              className={cn("me-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const count =
            opt.value === "all"
              ? counts.all || 0
              : counts[opt.value] || 0;
          return (
            <Button
              key={opt.value}
              size="sm"
              variant={statusFilter === opt.value ? "default" : "outline"}
              className={
                statusFilter === opt.value
                  ? "bg-shop_dark_green hover:bg-shop_btn_dark_green"
                  : ""
              }
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label} ({count})
            </Button>
          );
        })}
      </div>

      <Input
        placeholder="Search name, email, business, message…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-shop_dark_green" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <Store className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No wholesale inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="font-medium">{item.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>{item.businessName || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.businessType || ""}
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDate(item.submittedAt || item._createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          disabled={deletingId === item._id}
                          onClick={() => void handleDelete(item)}
                        >
                          {deletingId === item._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Wholesale inquiry</DialogTitle>
            <DialogDescription>
              Submitted {formatDate(selected?.submittedAt || selected?._createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{selected.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Mail className="h-3.5 w-3.5" />
                    <a
                      className="text-shop_dark_green underline"
                      href={`mailto:${selected.email}`}
                    >
                      {selected.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {selected.phone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {selected.businessName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business type</p>
                  <p>{selected.businessType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Estimated quantity
                  </p>
                  <p>{selected.estimatedOrderQuantity || "—"}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md border bg-shop_light_bg/40 p-3">
                  {selected.message || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Status</p>
                <Select
                  value={selected.status || "new"}
                  disabled={savingStatus}
                  onValueChange={(value) =>
                    void updateStatus(
                      selected._id,
                      value as WholesaleStatus,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== "all").map(
                      (o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
