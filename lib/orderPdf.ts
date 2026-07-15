import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { contactConfig } from "@/config/contact";
import {
  buildOrderLineRows,
  normalizeOrderTotals,
  type OrderDocumentLine,
  type OrderDocumentTotals,
} from "@/lib/orderDocument";

export type OrderPdfAddress = {
  name?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
};

export type OrderPdfInput = OrderDocumentTotals & {
  _id?: string;
  orderNumber?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderDate?: string;
  currency?: string;
  amountPaid?: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  packingNotes?: string;
  deliveryNotes?: string;
  isGuest?: boolean;
  address?: OrderPdfAddress;
  products?: OrderDocumentLine[];
};

const COLORS = {
  brand: "#063c28",
  brandSoft: "#e8f0ec",
  ink: "#111827",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f8faf9",
  white: "#ffffff",
  totalBar: "#063c28",
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 40,
};

function resolveLogoPath(): string | null {
  const candidates = [
    path.join(process.cwd(), "public", "logo.png"),
    path.join(process.cwd(), "images", "logo.png"),
  ];
  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const size = fs.statSync(candidate).size;
      if (size > 1_500_000) continue;
      return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function formatMoney(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase() || "USD",
    }).format(amount);
  } catch {
    return `$${Number(amount || 0).toFixed(2)}`;
  }
}

function pdfSafe(value: string): string {
  return String(value ?? "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00B7/g, "|")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

function formatLabel(value?: string): string {
  if (!value) return "-";
  return pdfSafe(
    value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  );
}

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function collectPdfBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

/** Draw text at x/y without advancing PDFKit's flow cursor (avoids blank pages). */
function textAt(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  options: PDFKit.Mixins.TextOptions = {},
) {
  const savedX = doc.x;
  const savedY = doc.y;
  doc.text(pdfSafe(text), x, y, { ...options, lineBreak: false });
  doc.x = savedX;
  doc.y = savedY;
}

function buildShippingLines(order: OrderPdfInput): string[] {
  const addr = order.address;
  if (!addr) return [];

  const street = addr.address || addr.street;
  const zip = addr.zip || addr.zipCode;
  const cityLine = [addr.city, addr.state, zip].filter(Boolean).join(", ");

  return [
    addr.name || order.customerName,
    street,
    cityLine,
    addr.country,
  ].filter((line): line is string => Boolean(line && String(line).trim()));
}

function drawColumnBlock(
  doc: PDFKit.PDFDocument,
  title: string,
  lines: string[],
  x: number,
  y: number,
  width: number,
): number {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.brand);
  textAt(doc, title.toUpperCase(), x, y, { width });
  let cursor = y + 16;

  doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink);
  if (lines.length === 0) {
    textAt(doc, "-", x, cursor, { width });
    return cursor + 14;
  }

  lines.forEach((line, index) => {
    doc
      .font(index === 0 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(index === 0 ? 10 : 9)
      .fillColor(COLORS.ink);
    textAt(doc, line, x, cursor, { width });
    cursor += index === 0 ? 14 : 13;
  });
  return cursor;
}

/**
 * Modern professional invoice PDF for admin order download.
 */
export async function buildOrderPdfBuffer(order: OrderPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, left: 0, right: 0, bottom: 0 },
    info: {
      Title: `Invoice ${order.orderNumber || order._id || ""}`,
      Author: contactConfig.company.name,
    },
  });

  // Park flow cursor permanently; every text draw restores position.
  doc.x = PAGE.margin;
  doc.y = PAGE.margin;

  const bufferPromise = collectPdfBuffer(doc);
  const company = contactConfig.company;
  const supportEmail = contactConfig.emails.support || company.email;
  const currency = (order.currency || "USD").toUpperCase();
  const totals = normalizeOrderTotals(order);
  const lines = buildOrderLineRows(order.products);
  const shippingLines = buildShippingLines(order);
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  const contentWidth = right - left;

  // --- Header band ---
  const headerHeight = 92;
  doc.rect(0, 0, PAGE.width, headerHeight).fill(COLORS.brand);

  // Accent strip under header
  doc.rect(0, headerHeight, PAGE.width, 4).fill(COLORS.brandSoft);

  const logoPath = resolveLogoPath();
  let brandX = left;
  if (logoPath) {
    try {
      doc.image(logoPath, left, 22, { width: 40, height: 40, fit: [40, 40] });
      brandX = left + 52;
    } catch {
      // skip logo
    }
  }

  doc.font("Helvetica-Bold").fontSize(18).fillColor(COLORS.white);
  textAt(doc, company.name || "Sheba Cup Coffee", brandX, 26, {
    width: contentWidth * 0.55,
  });

  doc.font("Helvetica").fontSize(8).fillColor("#d1e4da");
  const companyContact = [
    [company.address, company.city].filter(Boolean).join(", "),
    [company.phone, company.email].filter(Boolean).join("  ·  "),
  ].filter(Boolean);
  let companyY = 50;
  for (const line of companyContact) {
    textAt(doc, line, brandX, companyY, { width: contentWidth * 0.55 });
    companyY += 11;
  }

  doc.font("Helvetica-Bold").fontSize(22).fillColor(COLORS.white);
  textAt(doc, "INVOICE", left, 28, {
    width: contentWidth,
    align: "right",
  });

  doc.font("Helvetica").fontSize(9).fillColor("#d1e4da");
  textAt(doc, `#${order.orderNumber || order._id || "-"}`, left, 56, {
    width: contentWidth,
    align: "right",
  });

  // --- Meta strip ---
  let y = headerHeight + 22;
  doc.rect(left, y, contentWidth, 36).fill(COLORS.soft);

  const metaItems: Array<[string, string]> = [
    ["DATE", formatDate(order.orderDate)],
    ["STATUS", formatLabel(order.status)],
    ["PAYMENT", formatLabel(order.paymentMethod)],
    ["PAID", formatLabel(order.paymentStatus)],
  ];
  const metaColW = contentWidth / metaItems.length;
  metaItems.forEach(([label, value], index) => {
    const mx = left + index * metaColW + 10;
    doc.font("Helvetica").fontSize(7).fillColor(COLORS.muted);
    textAt(doc, label, mx, y + 8, { width: metaColW - 16 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink);
    textAt(doc, value, mx, y + 19, { width: metaColW - 16 });
  });
  y += 52;

  // --- Customer / Ship-to columns ---
  const colGap = 28;
  const colWidth = (contentWidth - colGap) / 2;
  const shipX = left + colWidth + colGap;

  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.brand);
  const customerLines = [
    order.customerName || shippingLines[0] || "-",
    order.email,
    order.phone || order.address?.phone
      ? `Phone: ${order.phone || order.address?.phone}`
      : "",
    order.isGuest === true
      ? "Guest checkout"
      : order.isGuest === false
        ? "Registered customer"
        : "",
  ].filter((line): line is string => Boolean(line && String(line).trim()));

  const customerBottom = drawColumnBlock(
    doc,
    "Bill to",
    customerLines,
    left,
    y,
    colWidth,
  );
  const shipBottom = drawColumnBlock(
    doc,
    "Ship to",
    shippingLines.length ? shippingLines : ["No shipping address on file"],
    shipX,
    y,
    colWidth,
  );
  y = Math.max(customerBottom, shipBottom) + 10;

  if (order.trackingNumber || order.estimatedDelivery) {
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
    const extras = [
      order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "",
      order.estimatedDelivery
        ? `Est. delivery: ${formatDate(order.estimatedDelivery)}`
        : "",
    ]
      .filter(Boolean)
      .join("    ·    ");
    if (extras) {
      textAt(doc, extras, left, y, { width: contentWidth });
      y += 18;
    }
  } else {
    y += 8;
  }

  // --- Items table ---
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.brand);
  textAt(doc, "ORDER ITEMS", left, y);
  y += 14;

  const colItem = left + 8;
  const colQty = left + contentWidth * 0.58;
  const colUnit = left + contentWidth * 0.68;
  const colTotal = left + contentWidth * 0.82;

  doc.rect(left, y, contentWidth, 22).fill(COLORS.brand);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.white);
  textAt(doc, "Item", colItem, y + 7, { width: contentWidth * 0.5 });
  textAt(doc, "Qty", colQty, y + 7, { width: 36, align: "right" });
  textAt(doc, "Unit", colUnit, y + 7, { width: 54, align: "right" });
  textAt(doc, "Total", colTotal, y + 7, {
    width: right - colTotal - 8,
    align: "right",
  });
  y += 28;

  if (lines.length === 0) {
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    textAt(doc, "No line items on this order.", colItem, y);
    y += 22;
  }

  lines.forEach((row, index) => {
    const productLine = order.products?.find(
      (line) => line.product?.name === row.name,
    );
    const grind =
      productLine?.grind?.label ||
      (productLine?.grind?.type
        ? formatLabel(productLine.grind.type)
        : undefined);
    const details = [
      row.weight ? row.weight : "",
      grind || "",
      row.packaging || "",
    ]
      .filter(Boolean)
      .join("  ·  ");

    const rowHeight = details ? 34 : 24;
    if (y + rowHeight > PAGE.height - 160) {
      doc.addPage();
      doc.x = PAGE.margin;
      doc.y = PAGE.margin;
      y = PAGE.margin;
    }

    if (index % 2 === 0) {
      doc.rect(left, y - 4, contentWidth, rowHeight).fill(COLORS.soft);
    }

    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.ink);
    textAt(doc, row.name, colItem, y, { width: contentWidth * 0.5 });

    if (details) {
      doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted);
      textAt(doc, details, colItem, y + 12, { width: contentWidth * 0.5 });
    }

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.ink);
    textAt(doc, String(row.quantity), colQty, y, {
      width: 36,
      align: "right",
    });
    textAt(
      doc,
      formatMoney(row.unitPrice + row.packagingPrice, currency),
      colUnit,
      y,
      { width: 54, align: "right" },
    );
    doc.font("Helvetica-Bold");
    textAt(doc, formatMoney(row.lineTotal, currency), colTotal, y, {
      width: right - colTotal - 8,
      align: "right",
    });

    y += rowHeight + 2;
  });

  y += 10;
  doc
    .moveTo(left, y)
    .lineTo(right, y)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  y += 16;

  // --- Totals panel ---
  const totalsWidth = 220;
  const totalsX = right - totalsWidth;
  const totalRows: Array<[string, number, boolean]> = [
    ["Subtotal", totals.subtotal, false],
  ];
  if (totals.packagingFee > 0) {
    totalRows.push(["Packaging", totals.packagingFee, false]);
  }
  if (totals.shipping > 0) {
    totalRows.push(["Shipping", totals.shipping, false]);
  }
  if (totals.tax > 0) {
    totalRows.push(["Tax", totals.tax, false]);
  }
  if (totals.discount > 0) {
    totalRows.push(["Discount", -totals.discount, false]);
  }

  for (const [label, amount] of totalRows) {
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    textAt(doc, label, totalsX, y, { width: 100 });
    doc.fillColor(COLORS.ink);
    textAt(doc, formatMoney(amount, currency), totalsX, y, {
      width: totalsWidth,
      align: "right",
    });
    y += 15;
  }

  y += 4;
  doc.rect(totalsX - 8, y - 4, totalsWidth + 8, 28).fill(COLORS.totalBar);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.white);
  textAt(doc, "Total due", totalsX, y + 6, { width: 90 });
  textAt(doc, formatMoney(totals.total, currency), totalsX, y + 6, {
    width: totalsWidth,
    align: "right",
  });
  y += 36;

  if (typeof order.amountPaid === "number" && order.amountPaid > 0) {
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
    textAt(
      doc,
      `Amount paid: ${formatMoney(order.amountPaid, currency)}`,
      totalsX,
      y,
      { width: totalsWidth, align: "right" },
    );
    y += 14;
  }

  // --- Notes ---
  const noteBlocks: Array<[string, string | undefined]> = [
    ["Order notes", order.notes],
    ["Packing notes", order.packingNotes],
    ["Delivery notes", order.deliveryNotes],
  ].filter(([, value]) => Boolean(value?.trim())) as Array<[string, string]>;

  if (noteBlocks.length) {
    y += 8;
    doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.brand);
    textAt(doc, "NOTES", left, y);
    y += 14;
    for (const [label, value] of noteBlocks) {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.ink);
      textAt(doc, label, left, y);
      y += 12;
      doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
      // Multi-line notes: use a bounded height via manual wrap approximation
      const safe = pdfSafe(value || "");
      const words = safe.split(/\s+/);
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (next.length > 95) {
          textAt(doc, line, left, y, { width: contentWidth });
          y += 11;
          line = word;
        } else {
          line = next;
        }
      }
      if (line) {
        textAt(doc, line, left, y, { width: contentWidth });
        y += 14;
      }
    }
  }

  // --- Footer ---
  const footerY = PAGE.height - 48;
  doc
    .moveTo(left, footerY)
    .lineTo(right, footerY)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted);
  textAt(
    doc,
    `Thank you for choosing ${company.name || "Sheba Cup Coffee"}. Questions? ${supportEmail}`,
    left,
    footerY + 10,
    { width: contentWidth, align: "center" },
  );
  textAt(doc, contactConfig.legal.copyright, left, footerY + 22, {
    width: contentWidth,
    align: "center",
  });

  doc.x = PAGE.margin;
  doc.y = PAGE.margin;
  doc.end();
  return bufferPromise;
}
