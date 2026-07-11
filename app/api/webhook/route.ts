import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/orderStatus";
import { sendOrderStatusNotification } from "@/lib/notificationService";
import { decrementOrderStock } from "@/lib/stock";

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
        // Idempotency guard: if this order is already paid, skip re-processing
        // (stock decrement, invoice, notifications) on webhook retries.
        const alreadyProcessed = await backendClient.fetch<{
          paymentStatus?: string;
        } | null>(
          `*[_type == "order" && _id == $orderId][0]{ paymentStatus }`,
          { orderId },
        );

        if (alreadyProcessed?.paymentStatus === PAYMENT_STATUSES.PAID) {
          return NextResponse.json({ received: true, skipped: "duplicate" });
        }

        // Generate invoice if not already exists
        let invoice: Stripe.Invoice | null = null;

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
                  customerEmail: order.email || session.customer_details?.email || "",
                  orderNumber: order.orderNumber,
                  currency: order.currency,
                  tax: order.tax || 0,
                  shipping: order.shipping || 0,
                },
              );
            }
          }
        }

        await updateOrderWithPaymentCompletion(orderId, session, invoice);
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

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      description: `Invoice for Order ${orderData.orderNumber || orderId}`,
      metadata: {
        orderId: orderId,
        orderNumber: orderData.orderNumber || "",
        source: "webhook",
      },
      auto_advance: false,
      collection_method: "charge_automatically",
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

    return finalizedInvoice;
  } catch (error) {
    console.error(`Error creating invoice for order ${orderId}:`, error);
    return null;
  }
}

async function updateOrderWithPaymentCompletion(
  orderId: string,
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
  const { id, customer, payment_intent } = session;

  // First, get the order to check its current status and payment method
  const existingOrder = await backendClient.fetch(
    `*[_type == "order" && _id == $orderId][0]{
      status,
      paymentMethod,
      paymentStatus
    }`,
    { orderId }
  );

  // Prepare update data
  const amountPaid =
    typeof session.amount_total === "number"
      ? session.amount_total / 100
      : undefined;

  const updateData: Record<string, unknown> = {
    paymentStatus: PAYMENT_STATUSES.PAID,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: payment_intent as string,
    stripeCustomerId: customer as string, // Store the correct Stripe customer ID
    paymentCompletedAt: new Date().toISOString(),
  };

  if (amountPaid !== undefined) {
    updateData.amountPaid = amountPaid;
  }

  // Order status logic:
  // 1. For COD orders paid later: Keep current delivery status (packed, out_for_delivery, etc.)
  // 2. For new checkout orders: Set status to "pending" to start the fulfillment workflow
  // 3. For orders already in processing: Keep current status
  if (existingOrder?.paymentMethod === "cash_on_delivery") {
    // COD order paid online - keep current status
    // Don't update status at all
  } else {
    // New checkout order or card payment - set to pending to start workflow
    updateData.status = ORDER_STATUSES.PENDING;
  }

  // Add invoice data if available
  if (invoice) {
    updateData.invoice = {
      id: invoice.id,
      number: invoice.number,
      hosted_invoice_url: invoice.hosted_invoice_url,
    };
  }

  try {
    // Update the existing order in Sanity
    await backendClient.patch(orderId).set(updateData).commit();

    // Get the order to access products for stock updates and user info
    const order = await backendClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        clerkUserId,
        status,
        paymentMethod,
        products,
        user -> {
          clerkUserId
        }
      }`,
      { orderId }
    );

    if (order) {
      // Update stock levels for purchased products.
      // COD orders already decremented stock at creation — skip to avoid
      // double-decrement if a COD order is later paid online.
      if (order.products && order.paymentMethod !== "cash_on_delivery") {
        await decrementOrderStock(order.products);
      }

      // Send payment confirmation notification
      try {
        const userClerkId = order.clerkUserId || order.user?.clerkUserId;

        if (userClerkId) {
          await sendOrderStatusNotification({
            clerkUserId: userClerkId,
            orderNumber: order.orderNumber,
            orderId: orderId,
            status: order.status || ORDER_STATUSES.PENDING,
          });
        }
      } catch (notificationError) {
        console.error(
          "Failed to send payment confirmation notification:",
          notificationError
        );
        // Don't fail the webhook if notification fails
      }
    }
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}
