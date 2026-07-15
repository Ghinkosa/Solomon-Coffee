"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  MessageSquare,
  Trash2,
  Eye,
  Mail,
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

type ContactStatus = "new" | "read" | "replied" | "closed";
type ContactPriority = "low" | "medium" | "high" | "urgent";

type ContactMessage = {
  _id: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: ContactStatus;
  priority?: ContactPriority;
  submittedAt?: string;
  _createdAt?: string;
};

type Counts = Record<string, number>;

const STATUS_OPTIONS: { value: ContactStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

function statusBadge(status?: string) {
  const tones: Record<string, string> = {
    new: "border-amber-200 bg-amber-50 text-amber-800",
    read: "border-sky-200 bg-sky-50 text-sky-800",
    replied: "border-emerald-200 bg-emerald-50 text-emerald-800",
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

function priorityBadge(priority?: string) {
  const tones: Record<string, string> = {
    low: "border-slate-200 text-slate-600",
    medium: "border-sky-200 text-sky-700",
    high: "border-orange-200 text-orange-700",
    urgent: "border-red-200 text-red-700",
  };
  return (
    <Badge
      variant="outline"
      className={cn("capitalize shadow-none", tones[priority || ""] || "")}
    >
      {priority || "medium"}
    </Badge>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">(
    "all",
  );
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await safeApiCall(
        `/api/admin/contact?${params.toString()}`,
      );
      setMessages(data.messages || []);
      setCounts(data.counts || {});
    } catch (error) {
      handleApiError(error, "Contact fetch");
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const patchMessage = async (
    messageId: string,
    patch: { status?: ContactStatus; priority?: ContactPriority },
  ) => {
    setSaving(true);
    try {
      const data = await safeApiCall("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, ...patch }),
      });
      setMessages((prev) =>
        prev.map((item) => (item._id === messageId ? data.message : item)),
      );
      if (selected?._id === messageId) setSelected(data.message);
      toast.success("Message updated");
      void fetchMessages();
    } catch (error) {
      handleApiError(error, "Contact update");
      toast.error(
        error instanceof Error ? error.message : "Failed to update message",
      );
    } finally {
      setSaving(false);
    }
  };

  const openMessage = async (item: ContactMessage) => {
    setSelected(item);
    if (item.status === "new") {
      try {
        const data = await safeApiCall("/api/admin/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: item._id, status: "read" }),
        });
        setSelected(data.message);
        setMessages((prev) =>
          prev.map((m) => (m._id === item._id ? data.message : m)),
        );
        void fetchMessages();
      } catch (error) {
        handleApiError(error, "Auto mark read");
      }
    }
  };

  const handleDelete = async (item: ContactMessage) => {
    if (!window.confirm(`Delete message from ${item.name || item.email}?`)) {
      return;
    }
    setDeletingId(item._id);
    try {
      await safeApiCall(`/api/admin/contact?id=${item._id}`, {
        method: "DELETE",
      });
      toast.success("Message deleted");
      if (selected?._id === item._id) setSelected(null);
      await fetchMessages();
    } catch (error) {
      handleApiError(error, "Contact delete");
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions from the website."
        actions={
          <Button
            variant="outline"
            onClick={() => void fetchMessages()}
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
            opt.value === "all" ? counts.all || 0 : counts[opt.value] || 0;
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
        placeholder="Search name, email, subject, message…"
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
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden md:table-cell">Received</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No contact messages found.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((item) => (
                  <TableRow
                    key={item._id}
                    className={
                      item.status === "new" ? "bg-amber-50/40" : undefined
                    }
                  >
                    <TableCell>
                      <div className="font-medium">{item.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {item.subject || "—"}
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {priorityBadge(item.priority)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {formatDate(item.submittedAt || item._createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void openMessage(item)}
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
            <DialogTitle>{selected?.subject || "Message"}</DialogTitle>
            <DialogDescription>
              From {selected?.name} ·{" "}
              {formatDate(selected?.submittedAt || selected?._createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <a
                  className="inline-flex items-center gap-1 font-medium text-shop_dark_green underline"
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                </a>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md border bg-shop_light_bg/40 p-3">
                  {selected.message || "—"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Select
                    value={selected.status || "new"}
                    disabled={saving}
                    onValueChange={(value) =>
                      void patchMessage(selected._id, {
                        status: value as ContactStatus,
                      })
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
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Select
                    value={selected.priority || "medium"}
                    disabled={saving}
                    onValueChange={(value) =>
                      void patchMessage(selected._id, {
                        priority: value as ContactPriority,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ["low", "medium", "high", "urgent"] as ContactPriority[]
                      ).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
