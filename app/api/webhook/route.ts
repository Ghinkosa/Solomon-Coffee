import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { decrementOrderStock } from "@/lib/stock";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { getEmailImageUrl } from "@/lib/emailImageUtils";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      {
        error: "No signature",
      },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: "Stripe webhook secret is not set",
      },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      {
        error: `Webhook Error: ${error}`,
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Get orderId from session metadata
      const orderId = session.metadata?.orderId;

      // Only treat the order as paid when Stripe confirms payment.
      if (session.payment_status && session.payment_status !== "paid") {
        return NextResponse.json({ received: true, skipped: "unpaid" });
      }

      if (orderId) {
        const existing = await backendClient.fetch<{
          _rev?: string;
          paymentStatus?: string;
          paymentMethod?: string;
          fulfillmentProcessed?: boolean;
          stockDecremented?: boolean;
        } | null>(
          `*[_type == "order" && _id == $orderId][0]{
            _rev, paymentStatus, paymentMethod, fulfillmentProcessed, stockDecremented
          }`,
          { orderId },
        );

        if (!existing?._rev) {
          // Order not created yet — return 400 so Stripe retries later.
          return NextResponse.json(
            { error: "Order not found for session" },
            { status: 400 },
          );
        }

        // Idempotency gate: only skip once fulfillment has FULLY completed.
        // (Do not gate on paymentStatus — a mid-way failure must be resumable.)
        if (existing.fulfillmentProcessed) {
          return NextResponse.json({ received: true, skipped: "duplicate" });
        }

        // Persist ALL payment details together with the PAID flag in one atomic,
        // revision-locked commit. This guarantees stripePaymentIntentId /
        // amountPaid are stored whenever the order is marked paid (so it stays
        // refundable), and prevents two concurrent deliveries from both
        // proceeding. A sequential retry re-fetches the revision and resumes.
        const amountPaid =
          typeof session.amount_total === "number"
            ? session.amount_total / 100
            : undefined;

        const paymentUpdate: Record<string, unknown> = {
          paymentStatus: PAYMENT_STATUSES.PAID,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          paymentCompletedAt: new Date().toISOString(),
        };
        if (session.customer) {
          paymentUpdate.stripeCustomerId = session.customer as string;
        }
        if (amountPaid !== undefined) {
          paymentUpdate.amountPaid = amountPaid;
        }
        // New checkout/card orders start the fulfillment workflow; a COD order
        // paid online keeps its current delivery status.
        if (existing.paymentMethod !== "cash_on_delivery") {
          paymentUpdate.status = ORDER_STATUSES.PENDING;
        }

        try {
          await backendClient
            .patch(orderId)
            .ifRevisionId(existing._rev)
            .set(paymentUpdate)
            .commit();
        } catch {
          // Another concurrent delivery claimed it; it will finish fulfillment.
          return NextResponse.json({ received: true, skipped: "duplicate" });
        }

        // Side effects below are each guarded/best-effort. fulfillmentProcessed
        // is only set after they all complete, so a retry can safely resume.

        // 1. Stock decrement — exactly once, never for COD (done at creation).
        if (
          existing.paymentMethod !== "cash_on_delivery" &&
          !existing.stockDecremented
        ) {
          const stockOrder = await backendClient.fetch<{
            products?: Array<{
              product: { _ref: string };
              quantity: number;
              weight?: { value?: string; price?: number };
            }>;
          } | null>(
            `*[_type == "order" && _id == $orderId][0]{ products }`,
            { orderId },
          );

          if (stockOrder?.products) {
            await decrementOrderStock(stockOrder.products);
            await backendClient
              .patch(orderId)
              .set({ stockDecremented: true })
              .commit();
          }
        }

        // 2. Invoice — best-effort; must never abort fulfillment persistence.
        try {
          await generateAndAttachInvoice(orderId, session);
        } catch (invoiceError) {
          console.error(
            `Invoice generation failed for order ${orderId}:`,
            invoiceError,
          );
        }

        // 3. Payment confirmation notification — best-effort.
        try {
          await sendPaymentNotification(orderId);
        } catch (notificationError) {
          console.error(
            "Failed to send payment confirmation notification:",
            notificationError,
          );
        }

        // 4. Confirmation email — best-effort. Sent here (post-payment) for
        // Stripe orders. COD orders already received their email at placement,
        // so skip them to avoid duplicates when a COD order is paid online.
        if (existing.paymentMethod !== "cash_on_delivery") {
          try {
            await sendConfirmationEmail(orderId);
          } catch (emailError) {
            console.error(
              `Failed to send confirmation email for order ${orderId}:`,
              emailError,
            );
          }
        }

        // 5. Mark fully processed — the real idempotency flag.
        await backendClient
          .patch(orderId)
          .set({ fulfillmentProcessed: true })
          .commit();
      } else {
        console.error("No orderId found in session metadata");
        return NextResponse.json(
          {
            error: "No orderId found in session metadata",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error processing order:", error);
      return NextResponse.json(
        {
          error: `Error processing order: ${error}`,
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

// Helper function to create and finalize an invoice
async function createAndFinalizeInvoice(
  orderId: string,
  stripeCustomerId: string,
  products: {
    product: { _id?: string; name: string; price?: number };
    quantity: number;
  }[],
  orderData: {
    totalAmount: number;
    customerEmail: string;
    orderNumber?: string;
    currency?: string;
    tax?: number;
    shipping?: number;
  }
) {
  try {
    // Validate required data
    if (!stripeCustomerId) {
      console.error(`Missing stripeCustomerId for order: ${orderId}`);
      return null;
    }

    if (!products || products.length === 0) {
      console.error(`No products found for order: ${orderId}`);
      return null;
    }

    // Validate currency
    const currency = (orderData.currency || "USD").toLowerCase();
    if (!["usd", "eur", "gbp", "cad", "aud"].includes(currency)) {
      console.warn(`Unsupported currency: ${currency}, defaulting to USD`);
    }

    // Create the invoice as a RECEIPT for an order already paid via Checkout.
    // Use send_invoice (not charge_automatically) so finalizing never attempts
    // a second charge against the customer's payment method.
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      description: `Invoice for Order ${orderData.orderNumber || orderId}`,
      metadata: {
        orderId: orderId,
        orderNumber: orderData.orderNumber || "",
        source: "webhook",
      },
      auto_advance: false,
      collection_method: "send_invoice",
      days_until_due: 30,
    });

    // Add invoice items for products
    for (const item of products) {
      if (!item.product || !item.product.name || !item.product.price) {
        console.warn(`Skipping invalid product in order ${orderId}:`, item);
        continue;
      }

      try {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id,
          amount: Math.round(item.product.price * item.quantity * 100),
          currency: currency,
          description: `${item.product.name} x ${item.quantity}`,
          metadata: {
            productId: item.product._id || "",
            quantity: item.quantity.toString(),
          },
        });
      } catch (error) {
        console.error(`Failed to add invoice item:`, error);
        throw error;
      }
    }

    // Add tax if any
    if (orderData.tax && orderData.tax > 0) {
      try {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id,
          amount: Math.round(orderData.tax * 100),
          currency: currency,
          description: "Tax",
          metadata: { type: "tax" },
        });
      } catch (error) {
        console.error(`Failed to add tax:`, error);
        throw error;
      }
    }

    // Add shipping if any
    if (orderData.shipping && orderData.shipping > 0) {
      try {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id,
          amount: Math.round(orderData.shipping * 100),
          currency: currency,
          description: "Shipping",
          metadata: { type: "shipping" },
        });
      } catch (error) {
        console.error(`Failed to add shipping:`, error);
        throw error;
      }
    }

    // Finalize the invoice
    if (!invoice.id) {
      throw new Error("Failed to create invoice - no invoice ID");
    }

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // The order was already paid through Checkout — mark the receipt invoice as
    // paid out of band so it isn't left "open" and never triggers a charge.
    if (finalizedInvoice.id) {
      try {
        return await stripe.invoices.pay(finalizedInvoice.id, {
          paid_out_of_band: true,
        });
      } catch (payError) {
        console.error(
          `Failed to mark invoice ${finalizedInvoice.id} paid out of band:`,
          payError,
        );
        return finalizedInvoice;
      }
    }

    return finalizedInvoice;
  } catch (error) {
    console.error(`Error creating invoice for order ${orderId}:`, error);
    return null;
  }
}

// Build (or retrieve) the Stripe invoice for a paid order and attach it to the
// Sanity order. Best-effort: callers wrap this so a failure never blocks
// fulfillment. Payment details are already persisted by the time this runs.
async function generateAndAttachInvoice(
  orderId: string,
  session: Stripe.Checkout.Session,
) {
  let invoice: Stripe.Invoice | null = null;
  let createdCustomerId: string | null = null;

  if (session.invoice) {
    invoice = await stripe.invoices.retrieve(session.invoice as string);
  } else if (session.payment_intent) {
    let stripeCustomerId = session.customer as string | null;

    // Checkout may only have customer_details when no Stripe customer exists yet.
    if (!stripeCustomerId && session.customer_details?.email) {
      const customer = await stripe.customers.create({
        email: session.customer_details.email,
        name: session.customer_details.name || undefined,
      });
      stripeCustomerId = customer.id;
      createdCustomerId = customer.id;
    }

    if (stripeCustomerId) {
      const order = await backendClient.fetch(
        `*[_type == "order" && _id == $orderId][0]{
          _id,
          orderNumber,
          email,
          products[]{ product->{_id, name, price, currency}, quantity },
          subtotal,
          tax,
          shipping,
          totalPrice,
          totalAmount,
          currency
        }`,
        { orderId },
      );

      if (order) {
        invoice = await createAndFinalizeInvoice(
          orderId,
          stripeCustomerId,
          order.products || [],
          {
            totalAmount: order.totalAmount || order.totalPrice || 0,
            customerEmail:
              order.email || session.customer_details?.email || "",
            orderNumber: order.orderNumber,
            currency: order.currency,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
          },
        );
      }
    }
  }

  const patchData: Record<string, unknown> = {};
  if (createdCustomerId) {
    patchData.stripeCustomerId = createdCustomerId;
  }
  if (invoice) {
    patchData.invoice = {
      id: invoice.id,
      number: invoice.number,
      hosted_invoice_url: invoice.hosted_invoice_url,
    };
  }

  if (Object.keys(patchData).length > 0) {
    await backendClient.patch(orderId).set(patchData).commit();
  }
}

// Send the payment-confirmation notification for a paid order. Best-effort.
async function sendPaymentNotification(orderId: string) {
  const order = await backendClient.fetch(
    `*[_type == "order" && _id == $orderId][0]{
      orderNumber,
      clerkUserId,
      user -> { clerkUserId }
    }`,
    { orderId },
  );

  if (!order) return;

  const userClerkId = order.clerkUserId || order.user?.clerkUserId;
  if (userClerkId) {
    // Explicitly notify about the PAYMENT (not the pending order status) so the
    // customer sees "Payment Confirmed" rather than a second "Order Received".
    await sendOrderStatusNotification({
      clerkUserId: userClerkId,
      orderNumber: order.orderNumber,
      orderId,
      status: PAYMENT_STATUSES.PAID,
    });
  }
}

// Send the order-confirmation email for a paid Stripe order. Best-effort:
// runs after payment details are persisted, so a failure never blocks
// fulfillment. Works for both guest and signed-in orders (uses order.email).
async function sendConfirmationEmail(orderId: string) {
  const order = await backendClient.fetch<{
    orderNumber?: string;
    email?: string;
    customerName?: string;
    orderDate?: string;
    subtotal?: number;
    shipping?: number;
    tax?: number;
    totalPrice?: number;
    address?: {
      name?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    products?: Array<{
      quantity: number;
      weight?: { price?: number };
      product?: {
        name?: string;
        price?: number;
        image?: unknown;
      };
    }>;
  } | null>(
    `*[_type == "order" && _id == $orderId][0]{
      orderNumber,
      email,
      customerName,
      orderDate,
      subtotal,
      shipping,
      tax,
      totalPrice,
      address,
      products[]{
        quantity,
        weight,
        product->{ name, price, "image": images[0] }
      }
    }`,
    { orderId },
  );

  if (!order?.email) return;

  await sendOrderConfirmationEmail({
    customerName: order.customerName || "Customer",
    customerEmail: order.email,
    orderId: order.orderNumber || orderId,
    orderDate: order.orderDate
      ? new Date(order.orderDate).toLocaleDateString()
      : new Date().toLocaleDateString(),
    items: (order.products || []).map((p) => ({
      name: p.product?.name || "Product",
      price: p.weight?.price || p.product?.price || 0,
      quantity: p.quantity,
      image: getEmailImageUrl(
        p.product?.image as Parameters<typeof getEmailImageUrl>[0],
      ),
    })),
    subtotal: order.subtotal || 0,
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    total: order.totalPrice || 0,
    shippingAddress: {
      name: order.address?.name || order.customerName || "",
      street: order.address?.address || "",
      city: order.address?.city || "",
      state: order.address?.state || "",
      zipCode: order.address?.zip || "",
      country: "United States",
    },
  });
}
