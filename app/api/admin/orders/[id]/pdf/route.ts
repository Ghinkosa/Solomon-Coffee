import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminAuth";
import { readClient } from "@/sanity/lib/client";
import { buildOrderPdfBuffer } from "@/lib/orderPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_PDF_QUERY = `*[_type == "order" && _id == $id][0] {
  _id,
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
  amountPaid,
  trackingNumber,
  estimatedDelivery,
  notes,
  packingNotes,
  deliveryNotes,
  isGuest,
  address {
    name,
    address,
    city,
    state,
    zip
  },
  products[] {
    _key,
    quantity,
    weight,
    grind,
    packaging,
    product-> {
      _id,
      name,
      price
    }
  },
  subtotal,
  tax,
  shipping,
  amountDiscount,
  packagingFee
}`;

function safeFilename(orderNumber: string | undefined, id: string): string {
  const raw = (orderNumber || id).replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `order-${raw}.pdf`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const order = await readClient.fetch(ORDER_PDF_QUERY, { id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdfBuffer = await buildOrderPdfBuffer(order);
    const filename = safeFilename(order.orderNumber, id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Admin order PDF failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate order PDF";
    return NextResponse.json(
      {
        error: "Failed to generate order PDF",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {}),
      },
      { status: 500 },
    );
  }
}
