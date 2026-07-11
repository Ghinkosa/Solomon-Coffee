"use client";

import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import PriceFormatter from "./PriceFormatter";
import { MY_ORDERS_QUERY_RESULT } from "@/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "./ui/button";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface OrderDetailsDialogProps {
  order: MY_ORDERS_QUERY_RESULT[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const dictionary = useDictionary();
  const d = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.orders.dialog.${path}`, fallback);
  const detail = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.orders.detail.${path}`, fallback);
  const l = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.orders.list.${path}`, fallback);

  const getStatusLabel = (status?: string | null) => {
    if (!status) return l("status.pending", "Pending");
    const key = status.toLowerCase().replace(/\s+/g, "_");
    return l(`status.${key}`, status.charAt(0).toUpperCase() + status.slice(1));
  };

  const getPaymentStatusLabel = (status?: string | null) => {
    if (!status) return detail("paymentStatus.pending", "Pending");
    const key = status.toLowerCase();
    return detail(`paymentStatus.${key}`, status);
  };

  const getPaymentMethodLabel = (method: string) => {
    const key = method.toLowerCase();
    return detail(`paymentMethods.${key}`, method.replace(/_/g, " "));
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            {d("title", "Order Details - {number}").replace(
              "{number}",
              order.orderNumber ?? ""
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>{d("customer", "Customer:")}</strong> {order.customerName}
          </p>
          <p>
            <strong>{d("email", "Email:")}</strong> {order.email}
          </p>
          <p>
            <strong>{d("date", "Date:")}</strong>{" "}
            {order.orderDate && new Date(order.orderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>{d("status", "Status:")}</strong>{" "}
            <span className="text-green-600 font-medium">
              {getStatusLabel(order.status)}
            </span>
          </p>
          {order?.paymentStatus && (
            <p>
              <strong>
                {detail("paymentStatusLabel", "Payment Status:")}
              </strong>{" "}
              <span
                className={`font-medium ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </p>
          )}
          {order?.paymentMethod && (
            <p>
              <strong>
                {detail("paymentMethodLabel", "Payment Method:")}
              </strong>{" "}
              <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
            </p>
          )}
          {order?.invoice?.number && (
            <p>
              <strong>{d("invoiceNumber", "Invoice Number:")}</strong>{" "}
              {order?.invoice?.number}
            </p>
          )}
          {order?.invoice?.hosted_invoice_url && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
              onClick={() =>
                window.open(order?.invoice?.hosted_invoice_url, "_blank")
              }
            >
              {d("viewInvoice", "View Invoice")}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{l("table.products", "Products")}</TableHead>
              <TableHead>{d("quantity", "Quantity")}</TableHead>
              <TableHead>{d("price", "Price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  {product?.product?.images && (
                    <Image
                      src={urlFor(product?.product?.images[0]).url()}
                      alt={l("productAlt", "Product")}
                      width={50}
                      height={50}
                      className="border rounded-sm"
                    />
                  )}

                  {product?.product && product?.product?.name}
                </TableCell>
                <TableCell>{product?.quantity}</TableCell>
                <TableCell>
                  <PriceFormatter
                    amount={product?.product?.price as number}
                    className="text-black font-medium"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 text-right flex items-center justify-end">
          <div className="w-44 flex flex-col gap-1">
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>{detail("discount", "Discount")}: </strong>
                <PriceFormatter
                  amount={order?.amountDiscount}
                  className="text-black font-bold"
                />
              </div>
            )}
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>{detail("subtotal", "Subtotal")}: </strong>
                <PriceFormatter
                  amount={
                    (order?.totalPrice as number) +
                    (order?.amountDiscount as number)
                  }
                  className="text-black font-bold"
                />
              </div>
            )}
            <div className="w-full flex items-center justify-between">
              <strong>{detail("total", "Total")}: </strong>
              <PriceFormatter
                amount={order?.totalPrice}
                className="text-black font-bold"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
