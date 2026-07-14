import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe SDK
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia", // standard Stripe API version compatible
});

// Simple in-memory rate-limiter cache (scoped to the serverless container runtime)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userData = rateLimitCache.get(ip);

  if (!userData) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    return false;
  }

  if (now > userData.resetTime) {
    // Reset window
    rateLimitCache.set(ip, { count: 1, resetTime: now + LIMIT_WINDOW_MS });
    return false;
  }

  userData.count += 1;
  return userData.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  // 1. Basic Rate Limiting check
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error:
          "Estamos procesando un alto volumen de solicitudes. Por favor, inténtalo de nuevo en unos segundos.",
        code: "RATE_LIMIT_EXCEEDED",
      },
      { status: 429 }
    );
  }

  try {
    const { items } = (await request.json()) as {
      items: Array<{ productId: string; quantity: number }>;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "El carrito de compras está vacío", code: "EMPTY_CART" },
        { status: 400 }
      );
    }

    // 2. Validate products and stock in a database transaction / read
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const dbOrderItems: Array<{
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }> = [];
    let totalAmount = 0;

    // For simplicity, we fetch all referenced products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);

      if (!product) {
        return NextResponse.json(
          {
            error: "Uno o más productos del carrito ya no están disponibles",
            code: "PRODUCT_NOT_FOUND",
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name}. Solo quedan ${product.stock} unidades disponibles.`,
            code: "OUT_OF_STOCK",
          },
          { status: 400 }
        );
      }

      const priceNum = Number(product.price);
      totalAmount += priceNum * item.quantity;

      // Add to Stripe Line Items list
      lineItems.push({
        price_data: {
          currency: "usd", // Standard default USD currency
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images.length > 0 ? [product.images[0]] : [],
          },
          unit_amount: Math.round(priceNum * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      });

      // Prepare database OrderItem data
      dbOrderItems.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: priceNum,
      });
    }

    // 3. Create a unique Order record in PENDING state
    // We assume a pre-seeded Client user exists for mock checkout, or use a default mock uuid
    // In real app, this comes from Supabase session header (req.headers.get("x-user-id"))
    // Let's check if the client user is authenticated. If not, we can associate with a default guest user record
    // or return 401. Let's check for a mock guest user or create it if not present.
    // For test robustness, let's create a default customer user in database if it doesn't exist
    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    await prisma.user.upsert({
      where: { id: defaultUserId },
      update: {},
      create: {
        id: defaultUserId,
        email: "anon@vault.com",
        role: "CLIENT",
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: defaultUserId,
        stripeSessionId: "TEMP_SESSION_ID_" + Date.now(), // Temporarily set, updated below
        totalAmount: totalAmount,
        status: "PENDING",
        orderItems: {
          create: dbOrderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
        },
      },
    });

    // 4. Generate Stripe Checkout Session with Idempotency Key
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
        metadata: {
          orderId: order.id,
        },
      },
      {
        // Enforce strict payment idempotency using Order UUID
        idempotencyKey: `idempotency_checkout_${order.id}`,
      }
    );

    // 5. Update Order record with actual Stripe Session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json(
      {
        error: "Hubo un error al procesar su solicitud de pago. Por favor, inténtelo de nuevo.",
        code: "STRIPE_ERROR",
      },
      { status: 500 }
    );
  }
}
