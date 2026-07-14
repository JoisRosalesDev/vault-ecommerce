import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error("Firma de webhook o secreto de endpoint faltante.");
    }
    // Verify cryptographic signature from Stripe
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido";
    console.error("Webhook signature verification failed:", errorMsg);
    return NextResponse.json(
      { error: `Firma de webhook no válida: ${errorMsg}` },
      { status: 400 }
    );
  }

  // Handle the specific payment completion event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("Missing orderId in Stripe session metadata");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      // 1. Idempotency Check: Load the order and check status before mutational updates
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        console.error(`Order not found for ID: ${orderId}`);
        return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
      }

      if (order.status === "PAID") {
        console.log(`Order ${orderId} is already marked as PAID. Skipping duplicate processing.`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // 2. Transactional Stock Decrement & Status Update
      await prisma.$transaction(async (tx) => {
        // Update Order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });

        // Decrement stock for each purchased item
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Producto ${item.productId} no encontrado durante el checkout.`);
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para ${product.name} al completar la orden ${orderId}.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      });

      console.log(`Order ${orderId} successfully completed and stock updated.`);
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : "Error desconocido";
      console.error("Failed to fulfill order database operations:", errorMsg);
      // We return 500 so Stripe knows to retry later
      return NextResponse.json(
        { error: `Database fulfillment error: ${errorMsg}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
