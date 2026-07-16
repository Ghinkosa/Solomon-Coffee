"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  DollarSign,
  Loader2,
  Percent,
  RefreshCw,
  Save,
  Search,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { handleApiError, safeApiCall } from "./apiHelpers";

type StateRateRow = {
  stateCode: string;
  stateName: string;
  ratePercent: number;
  taxShipping: boolean;
};

type CheckoutSettingsResponse = {
  taxEnabled: boolean;
  flatShippingFee: number;
  freeShippingThreshold: number;
  businessDiscountPercent: number;
  premiumDiscountPercent: number;
  taxRatesReviewedAt: string | null;
  configuredStateCount: number;
  stateRates: StateRateRow[];
};

function formatReviewedAt(value: string | null): string {
  if (!value) return "Never reviewed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never reviewed";
  return date.toLocaleString();
}

export default function AdminCheckoutSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [flatShippingFee, setFlatShippingFee] = useState(10);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
  const [businessDiscountPercent, setBusinessDiscountPercent] = useState(2);
  const [premiumDiscountPercent, setPremiumDiscountPercent] = useState(5);
  const [taxRatesReviewedAt, setTaxRatesReviewedAt] = useState<string | null>(
    null,
  );
  const [configuredStateCount, setConfiguredStateCount] = useState(0);
  const [rows, setRows] = useState<StateRateRow[]>([]);
  const [search, setSearch] = useState("");
  const [dirty, setDirty] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await safeApiCall("/api/admin/checkout-settings")) as {
        success: boolean;
        settings: CheckoutSettingsResponse;
      };

      setTaxEnabled(Boolean(data.settings?.taxEnabled));
      setFlatShippingFee(data.settings?.flatShippingFee ?? 10);
      setFreeShippingThreshold(data.settings?.freeShippingThreshold ?? 100);
      setBusinessDiscountPercent(data.settings?.businessDiscountPercent ?? 2);
      setPremiumDiscountPercent(data.settings?.premiumDiscountPercent ?? 5);
      setTaxRatesReviewedAt(data.settings?.taxRatesReviewedAt ?? null);
      setConfiguredStateCount(data.settings?.configuredStateCount ?? 0);
      setRows(data.settings?.stateRates || []);
      setDirty(false);
    } catch (error) {
      handleApiError(error, "Failed to load checkout settings");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load checkout settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.stateCode.toLowerCase().includes(q) ||
        row.stateName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const updateRow = (
    stateCode: string,
    patch: Partial<Pick<StateRateRow, "ratePercent" | "taxShipping">>,
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.stateCode === stateCode ? { ...row, ...patch } : row,
      ),
    );
    setDirty(true);
  };

  const handleSave = async () => {
    if (!Number.isFinite(flatShippingFee) || flatShippingFee < 0) {
      toast.error("Flat shipping fee must be 0 or greater");
      return;
    }
    if (
      !Number.isFinite(freeShippingThreshold) ||
      freeShippingThreshold < 0
    ) {
      toast.error("Free shipping threshold must be 0 or greater");
      return;
    }
    if (
      !Number.isFinite(businessDiscountPercent) ||
      businessDiscountPercent < 0 ||
      businessDiscountPercent > 100
    ) {
      toast.error("Business discount must be between 0 and 100");
      return;
    }
    if (
      !Number.isFinite(premiumDiscountPercent) ||
      premiumDiscountPercent < 0 ||
      premiumDiscountPercent > 100
    ) {
      toast.error("Premium discount must be between 0 and 100");
      return;
    }

    for (const row of rows) {
      if (
        !Number.isFinite(row.ratePercent) ||
        row.ratePercent < 0 ||
        row.ratePercent > 100
      ) {
        toast.error(`${row.stateCode}: rate must be between 0 and 100`);
        return;
      }
    }

    setSaving(true);
    try {
      const data = (await safeApiCall("/api/admin/checkout-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxEnabled,
          flatShippingFee,
          freeShippingThreshold,
          businessDiscountPercent,
          premiumDiscountPercent,
          stateRates: rows.map((row) => ({
            stateCode: row.stateCode,
            ratePercent: row.ratePercent,
            taxShipping: row.taxShipping,
          })),
        }),
      })) as {
        success: boolean;
        settings: CheckoutSettingsResponse;
        message?: string;
      };

      setTaxEnabled(Boolean(data.settings?.taxEnabled));
      setFlatShippingFee(data.settings?.flatShippingFee ?? 10);
      setFreeShippingThreshold(data.settings?.freeShippingThreshold ?? 100);
      setBusinessDiscountPercent(data.settings?.businessDiscountPercent ?? 2);
      setPremiumDiscountPercent(data.settings?.premiumDiscountPercent ?? 5);
      setTaxRatesReviewedAt(data.settings?.taxRatesReviewedAt ?? null);
      setConfiguredStateCount(data.settings?.configuredStateCount ?? 0);
      setRows(data.settings?.stateRates || []);
      setDirty(false);
      toast.success(data.message || "Checkout settings saved");
    } catch (error) {
      handleApiError(error, "Failed to save checkout settings");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save checkout settings",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Checkout Settings"
        description="Configure shipping, account discounts, and US state sales tax."
        actions={
          <>
            <Button onClick={handleSave} disabled={loading || saving || !dirty}>
              {saving ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="me-2 h-4 w-4" />
              )}
              Save changes
            </Button>
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={loading || saving}
            >
              <RefreshCw
                className={`me-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-shop_dark_green" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-shop_light_green" />
                  Shipping charges
                </CardTitle>
                <CardDescription>
                  Flat-rate shipping for orders within the United States.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="flat-shipping-fee">
                      Flat shipping fee ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="flat-shipping-fee"
                        type="number"
                        min={0}
                        max={1000}
                        step="0.01"
                        value={flatShippingFee}
                        onChange={(event) => {
                          setFlatShippingFee(
                            parseFloat(event.target.value || "0"),
                          );
                          setDirty(true);
                        }}
                        disabled={saving}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="free-shipping-threshold">
                      Free shipping threshold ($)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="free-shipping-threshold"
                        type="number"
                        min={0}
                        max={100000}
                        step="0.01"
                        value={freeShippingThreshold}
                        onChange={(event) => {
                          setFreeShippingThreshold(
                            parseFloat(event.target.value || "0"),
                          );
                          setDirty(true);
                        }}
                        disabled={saving}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  The threshold is evaluated after discounts and packaging. Set
                  it to $0 to offer free shipping on every order.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-shop_light_green" />
                  Account discounts
                </CardTitle>
                <CardDescription>
                  Applied after product discounts. Business and premium do not
                  stack — the higher rate wins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="business-discount">
                      Business discount (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="business-discount"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={businessDiscountPercent}
                        onChange={(event) => {
                          setBusinessDiscountPercent(
                            parseFloat(event.target.value || "0"),
                          );
                          setDirty(true);
                        }}
                        disabled={saving}
                        className="pe-8"
                      />
                      <Percent className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="premium-discount">
                      Premium discount (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="premium-discount"
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        value={premiumDiscountPercent}
                        onChange={(event) => {
                          setPremiumDiscountPercent(
                            parseFloat(event.target.value || "0"),
                          );
                          setDirty(true);
                        }}
                        disabled={saving}
                        className="pe-8"
                      />
                      <Percent className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-shop_light_green" />
                      Sales tax
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Apply destination-based rates using the shipping state.
                    </CardDescription>
                  </div>
                  <Switch
                    id="tax-enabled"
                    checked={taxEnabled}
                    onCheckedChange={(checked) => {
                      setTaxEnabled(checked);
                      setDirty(true);
                    }}
                    disabled={saving}
                    aria-label="Enable sales tax"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Tax applies to discounted products and packaging. Shipping is
                  included only for states marked “Tax shipping.”
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">
                    {configuredStateCount} states with rates &gt; 0%
                  </Badge>
                  <Badge variant="outline">
                    Last reviewed: {formatReviewedAt(taxRatesReviewedAt)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  Manual tax compliance
                </CardTitle>
                <CardDescription className="text-amber-800/80">
                  These rates are merchant-managed. Saving updates the review
                  timestamp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-amber-950">
                <p>
                  Confirm you have nexus/registration where you collect tax.
                  State-only rates do not automatically include city, county, or
                  special-district taxes.
                </p>
                <p>
                  Review rates periodically and keep them aligned with your
                  accounting or tax advisor guidance.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search states..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {dirty ? <Badge variant="secondary">Unsaved changes</Badge> : null}
              <span className="text-sm text-muted-foreground">
                {filteredRows.length} of {rows.length} states
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>State tax rates</CardTitle>
                <CardDescription>
                  Enter percentages such as 6.25 for a 6.25% rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead className="w-[180px]">Rate (%)</TableHead>
                      <TableHead className="w-[180px]">Tax shipping</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-10 text-center text-muted-foreground"
                        >
                          No states found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((row) => (
                        <TableRow key={row.stateCode}>
                          <TableCell>
                            <div className="font-medium">{row.stateName}</div>
                            <div className="text-xs text-muted-foreground">
                              {row.stateCode}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative max-w-[140px]">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step="0.001"
                                value={
                                  Number.isFinite(row.ratePercent)
                                    ? row.ratePercent
                                    : 0
                                }
                                onChange={(event) =>
                                  updateRow(row.stateCode, {
                                    ratePercent: parseFloat(
                                      event.target.value || "0",
                                    ),
                                  })
                                }
                                disabled={saving || !taxEnabled}
                                className="pe-8"
                                aria-label={`${row.stateName} tax rate`}
                              />
                              <Percent className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                              <Checkbox
                                checked={row.taxShipping}
                                onCheckedChange={(checked) =>
                                  updateRow(row.stateCode, {
                                    taxShipping: checked === true,
                                  })
                                }
                                disabled={saving || !taxEnabled}
                              />
                              Include shipping
                            </label>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:hidden">
            {filteredRows.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No states found.
              </Card>
            ) : (
              filteredRows.map((row) => (
                <Card key={row.stateCode} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{row.stateName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.stateCode}
                      </p>
                    </div>
                    <div className="relative w-28">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.001"
                        value={
                          Number.isFinite(row.ratePercent)
                            ? row.ratePercent
                            : 0
                        }
                        onChange={(event) =>
                          updateRow(row.stateCode, {
                            ratePercent: parseFloat(
                              event.target.value || "0",
                            ),
                          })
                        }
                        disabled={saving || !taxEnabled}
                        className="pe-8"
                        aria-label={`${row.stateName} tax rate`}
                      />
                      <Percent className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-2 border-t pt-3 text-sm">
                    <Checkbox
                      checked={row.taxShipping}
                      onCheckedChange={(checked) =>
                        updateRow(row.stateCode, {
                          taxShipping: checked === true,
                        })
                      }
                      disabled={saving || !taxEnabled}
                    />
                    Tax shipping for this state
                  </label>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
