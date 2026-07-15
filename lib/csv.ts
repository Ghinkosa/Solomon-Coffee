import { NextResponse } from "next/server";

/** Escape a single CSV cell (RFC 4180-ish). */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function rowsToCsv(
  headers: string[],
  rows: Array<Array<unknown>>,
): string {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ];
  // BOM helps Excel open UTF-8 correctly
  return `\uFEFF${lines.join("\r\n")}`;
}

export function csvFileResponse(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): NextResponse {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const body = rowsToCsv(headers, rows);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}

export function formatCsvDate(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "";
  const date =
    typeof value === "number" ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}
