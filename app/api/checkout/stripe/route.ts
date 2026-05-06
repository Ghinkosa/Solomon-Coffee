import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { urlFor } from "@/sanity/lib/image";

export const POST = async (request: NextRequest) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const reqBody = await request.json();
    const { 
      orderId, 
      orderNumber, 
      items, 
      email, 
      shippingAddress, 
      orderAmount,
      shipping,
      tax
    } = reqBody;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Convert cart items to Stripe line items
    const lineItems: any[] = [];

    // Add products
    for (const item of items) {
      const productPrice = item.product?.price || 0;
      const packagingPrice = item.packaging?.price || 0;
      const totalPrice = productPrice + packagingPrice;
      const unitAmount = Math.round(totalPrice * 100);

      let productName = item.product?.name || "Product";
      if (item.packaging?.title) {
        productName = `${productName} (${item.packaging.title})`;
      }

      let productImages: string[] = [];
      if (item.product?.images?.[0]) {
        try {
          const imageUrl = urlFor(item.product.images[0]).width(800).height(600).url();
          if (imageUrl) {
            productImages = [imageUrl];
          }
        } catch (error) {
          console.warn("Failed to convert image URL:", error);
        }
      }

      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: productName,
            images: productImages,
          },
        },
      });
    }

    // Add shipping
    if (shipping && shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shipping * 100),
          product_data: {
            name: "Shipping Fee",
          },
        },
      });
    }

    // Add tax
    if (tax && tax > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(tax * 100),
          product_data: {
            name: "Tax",
          },
        },
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}&orderNumber=${orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/orders/${orderId}?cancelled=true`,
      metadata: {
        orderId: String(orderId),
        orderNumber: String(orderNumber || ""),
        email: String(email || ""),
      },
      customer_email: email,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe checkout session" },
      { status: 500 }
    );
  }
};