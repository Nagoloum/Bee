import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, wallets } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

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
      items,
      deliveryAddress,
      deliveryMode,
      deliveryFee,
      subtotal,
      discount,
      total,
      couponCode,
      couponDiscount,
      clientSecret,
    } = body;

    if (!items?.length) return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    if (!deliveryAddress?.fullName) return NextResponse.json({ error: "Adresse manquante." }, { status: 400 });

    // Group items by vendor (one order per vendor)
    const byVendor: Record<string, typeof items> = {};
    for (const item of items) {
      if (!byVendor[item.vendorId]) byVendor[item.vendorId] = [];
      byVendor[item.vendorId].push(item);
    }

    const createdOrderIds: string[] = [];

    for (const [vendorId, vendorItems] of Object.entries(byVendor)) {
      const vendorSubtotal = (vendorItems as any[]).reduce(
        (s: number, i: any) => s + i.unitPrice * i.quantity, 0
      );

      // Proportional discount per vendor
      const vendorDiscount = subtotal > 0
        ? Math.round((vendorSubtotal / subtotal) * discount)
        : 0;

      const vendorTotal = vendorSubtotal - vendorDiscount + (deliveryMode === "PLATFORM" ? deliveryFee : 0);

      const orderId = createId();
      createdOrderIds.push(orderId);

      // Create order
      await db.insert(orders).values({
        id:          orderId,
        orderNumber: generateOrderNumber(),
        clientId:    session.user.id,
        vendorId,
        subtotal:    vendorSubtotal,
        deliveryFee: deliveryMode === "PLATFORM" ? deliveryFee : 0,
        discount:    vendorDiscount,
        total:       vendorTotal,
        status:      "PENDING",
        paymentStatus: "PAID",  // Stripe confirmed payment
        paymentMethod: "STRIPE",
        deliveryMode,
        deliveryAddress,
        couponCode:      couponCode ?? null,
        couponDiscount:  vendorDiscount,
        stripePaymentIntentId: clientSecret?.split("_secret_")[0] ?? null,
      });

      // Create order items
      const orderItemsData = (vendorItems as any[]).map((item: any) => ({
        id:           createId(),
        orderId,
        productId:    item.productId,
        productName:  item.name,
        productImage: item.image ?? null,
        variantLabel: item.variantLabel ?? null,
        quantity:     item.quantity,
        unitPrice:    item.unitPrice,
        totalPrice:   item.unitPrice * item.quantity,
      }));
      await db.insert(orderItems).values(orderItemsData);

      // Create escrow entry in vendor wallet
      const vendorWallet = await db.select().from(wallets)
        .where(eq(wallets.userId, vendorId)).limit(1);

      if (vendorWallet[0]) {
        await db.update(wallets)
          .set({
            escrow:    (vendorWallet[0].escrow ?? 0) + vendorTotal,
            updatedAt: new Date(),
          })
          .where(eq(wallets.id, vendorWallet[0].id));
      }
    }

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
