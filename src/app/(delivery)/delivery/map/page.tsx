import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { deliveryAgents, orderDeliveries, orders, vendors } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { DeliveryMapClient } from "@/components/delivery/delivery-map-client";

export const revalidate = 0;

export default async function DeliveryMapPage() {
  const session = await requireRole(["DELIVERY"]);
  if (!session) redirect("/sign-in");

  const userId = (session.user as any).id;
  const agentRows = await db
    .select()
    .from(deliveryAgents)
    .where(eq(deliveryAgents.userId, userId))
    .limit(1);
  if (!agentRows[0]) redirect("/delivery");
  const agent = agentRows[0];

  let pins: any[] = [];
  try {
    const assigned = await db
      .select({
        orderId:         orders.id,
        orderNumber:     orders.orderNumber,
        deliveryAddress: orders.deliveryAddress,
        status:          orderDeliveries.status,
        fee:             (orderDeliveries as any).fee,
        vendorName:      vendors.shopName,
      })
      .from(orderDeliveries)
      .leftJoin(orders,  eq(orderDeliveries.orderId, orders.id))
      .leftJoin(vendors, eq(orders.vendorId, vendors.id))
      .where(and(
        eq(orderDeliveries.deliveryAgentId, agent.id),
        inArray(orderDeliveries.status, ["ASSIGNED","PICKED_UP","IN_TRANSIT"]),
      ))
      .limit(20);

    for (const o of assigned) {
      const addr = (o.deliveryAddress as any) ?? {};
      // Delivery pin — only if geocoded coords stored in address JSON
      if (addr.lat && addr.lng) {
        pins.push({
          orderId:     o.orderId,
          orderNumber: o.orderNumber,
          type:        "delivery",
          lat:         addr.lat,
          lng:         addr.lng,
          label:       addr.fullName ?? "Client",
          address:     [addr.address, addr.quarter, addr.city].filter(Boolean).join(", "),
          clientPhone: addr.phone ?? null,
          deliveryCode:(o as any).deliveryCode ?? null,
          status:      o.status,
        });
      }
    }
  } catch (err) {
    console.error("[map/page]", err);
  }

  return <DeliveryMapClient orders={pins} agentId={agent.id} />;
}
