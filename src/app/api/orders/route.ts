import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, wallets } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { awardCashback } from "@/lib/actions/cashback";
import { sendOrderConfirmation } from "@/lib/email/order-emails";
import { pushToUser } from "@/lib/pusher";
import { awardPoints } from "@/lib/actions/points-service";

function generateOrderNumber(): string {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `BEE-${ts}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const {
      items, deliveryAddress, deliveryMode, deliveryFee,
      subtotal, discount, total, couponCode,
    } = body;

    if (!items?.length)             return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    if (!deliveryAddress?.fullName) return NextResponse.json({ error: "Adresse manquante." }, { status: 400 });

    // Grouper par vendeur
    const byVendor: Record<string, typeof items> = {};
    for (const item of items) {
      if (!byVendor[item.vendorId]) byVendor[item.vendorId] = [];
      byVendor[item.vendorId].push(item);
    }

    const createdOrderIds: string[]     = [];
    const createdOrderNums: string[]    = [];
    const vendorIds:        string[]    = [];

    for (const [vendorId, vendorItems] of Object.entries(byVendor)) {
      const vendorSubtotal = (vendorItems as any[]).reduce(
        (s: number, i: any) => s + i.unitPrice * i.quantity, 0
      );
      const vendorDiscount    = subtotal > 0 ? Math.round((vendorSubtotal / subtotal) * (discount ?? 0)) : 0;
      const vendorDeliveryFee = deliveryMode === "PLATFORM" ? (deliveryFee ?? 0) : 0;
      const vendorTotal       = vendorSubtotal - vendorDiscount + vendorDeliveryFee;

      const orderId     = createId();
      const orderNumber = generateOrderNumber();
      createdOrderIds.push(orderId);
      createdOrderNums.push(orderNumber);
      vendorIds.push(vendorId);

      await db.insert(orders).values({
        id:            orderId,
        orderNumber,
        clientId:      session.user.id,
        vendorId,
        subtotal:      vendorSubtotal,
        deliveryFee:   vendorDeliveryFee,
        discount:      vendorDiscount,
        total:         vendorTotal,
        status:        "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "STRIPE",
        deliveryMode,
        deliveryAddress,
        couponCode:     couponCode ?? null,
        couponDiscount: vendorDiscount,
      });

      await db.insert(orderItems).values(
        (vendorItems as any[]).map((item: any) => ({
          id:           createId(),
          orderId,
          productId:    item.productId,
          productName:  item.name,
          productImage: item.image      ?? null,
          variantLabel: item.variantLabel ?? null,
          quantity:     item.quantity,
          unitPrice:    item.unitPrice,
          totalPrice:   item.unitPrice * item.quantity,
        }))
      );

      // Escrow wallet vendeur
      const vw = await db.select().from(wallets).where(eq(wallets.userId, vendorId)).limit(1);
      if (vw[0]) {
        await db.update(wallets)
          .set({ escrow: (vw[0].escrow ?? 0) + vendorTotal, updatedAt: new Date() })
          .where(eq(wallets.id, vw[0].id));
      }

      // ✅ Pusher → notification temps réel au vendeur
      pushToUser(vendorId, "new-order", {
        orderId,
        orderNumber,
        total:       vendorTotal,
        clientName:  session.user.name ?? "Client",
        itemsCount:  (vendorItems as any[]).length,
      }).catch(console.error);
    }

    // ✅ Email confirmation client (non-bloquant)
    sendOrderConfirmation({
      clientName:  session.user.name  ?? "Client",
      clientEmail: session.user.email,
      orderNumber: createdOrderNums[0],
      items: (items as any[]).map((i: any) => ({
        name:      i.name,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal:        subtotal    ?? 0,
      deliveryFee:     deliveryFee ?? 0,
      discount:        discount    ?? 0,
      total:           total       ?? 0,
      deliveryAddress,
    }).catch(console.error);

    // ✅ Cashback 5% (non-bloquant)
    awardCashback(session.user.id, total ?? 0, createdOrderIds[0]).catch(console.error);

    // ✅ Points BEE (1 pt par 10 FCFA, non-bloquant)
    awardPoints(session.user.id, total ?? 0, createdOrderIds[0]).catch(console.error);

    return NextResponse.json({
      success:  true,
      orderId:  createdOrderIds[0],
      orderIds: createdOrderIds,
    });
  } catch (err: any) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
