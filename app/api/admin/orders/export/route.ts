import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { readClient } from "@/sanity/lib/client";
import { csvFileResponse, formatCsvDate } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPORT_LIMIT = 5000;

function flattenItems(
  products:
    | Array<{
        quantity?: number;
        weight?: { value?: string };
        grind?: { label?: string; type?: string };
        packaging?: { title?: string };
        product?: { name?: string };
      }>
    | undefined,
): string {
  if (!products?.length) return "";
  return products
    .map((line) => {
      const name = line.product?.name || "Product";
      const qty = line.quantity ?? 1;
      const extras = [
        line.weight?.value,
        line.grind?.label || line.grind?.type,
        line.packaging?.title,
      ]
        .filter(Boolean)
        .join(" / ");
      return extras ? `${name} x${qty} (${extras})` : `${name} x${qty}`;
    })
    .join("; ");
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const search = (
      searchParams.get("search") ||
      searchParams.get("query") ||
      ""
    ).trim();

    const filters = [`_type == "order"`];
    const params: Record<string, unknown> = { limit: EXPORT_LIMIT };

    if (status) {
      filters.push(`status == $status`);
      params.status = status;
    }
    if (paymentMethod) {
      filters.push(`paymentMethod == $paymentMethod`);
      params.paymentMethod = paymentMethod;
    }
    if (search) {
      filters.push(
        `(orderNumber match $searchWild || customerName match $searchWild || email match $searchWild)`,
      );
      params.searchWild = `*${search}*`;
    }

    const filterClause = filters.join(" && ");
    const orders = await readClient.fetch(
      `*[${filterClause}] | order(orderDate desc) [0...$limit] {
        _id,
        _createdAt,
        orderNumber,
        customerName,
        email,
        phone,
        totalPrice,
        currency,
        status,
        paymentMethod,
        paymentStatus,
        orderDate,
        address,
        products[] {
          quantity,
          weight,
          grind,
          packaging,
          product-> { name }
        },
        subtotal,
        tax,
        shipping,
        amountDiscount,
        packagingFee,
        amountPaid,
        trackingNumber,
        estimatedDelivery,
        cancellationRequested,
        isGuest
      }`,
      params,
    );

    const headers = [
      "Order Number",
      "Order Date",
      "Status",
      "Payment Method",
      "Payment Status",
      "Customer Name",
      "Email",
      "Phone",
      "Ship Name",
      "Ship Address",
      "City",
      "State",
      "Zip",
      "Items",
      "Subtotal",
      "Shipping",
      "Tax",
      "Discount",
      "Packaging Fee",
      "Total",
      "Currency",
      "Amount Paid",
      "Tracking Number",
      "Estimated Delivery",
      "Guest",
      "Cancellation Requested",
      "Record ID",
      "Created At",
    ];

    const rows = (orders || []).map((order: Record<string, any>) => [
      order.orderNumber,
      formatCsvDate(order.orderDate),
      order.status,
      order.paymentMethod,
      order.paymentStatus,
      order.customerName,
      order.email,
      order.phone || "",
      order.address?.name || "",
      order.address?.address || "",
      order.address?.city || "",
      order.address?.state || "",
      order.address?.zip || "",
      flattenItems(order.products),
      order.subtotal ?? "",
      order.shipping ?? "",
      order.tax ?? "",
      order.amountDiscount ?? "",
      order.packagingFee ?? "",
      order.totalPrice ?? "",
      order.currency || "USD",
      order.amountPaid ?? "",
      order.trackingNumber || "",
      formatCsvDate(order.estimatedDelivery),
      order.isGuest ? "yes" : "no",
      order.cancellationRequested ? "yes" : "no",
      order._id,
      formatCsvDate(order._createdAt),
    ]);

    const stamp = new Date().toISOString().slice(0, 10);
    return csvFileResponse(`orders-${stamp}.csv`, headers, rows);
  } catch (error) {
    console.error("Admin orders CSV export failed:", error);
    return NextResponse.json(
      { error: "Failed to export orders CSV" },
      { status: 500 },
    );
  }
}
