import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { deliveryAgents, orderDeliveries, orders, vendors, users } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { DeliveryOrdersClient } from "@/components/delivery/delivery-orders-client";

export const revalidate = 0;

export default async function DeliveryOrdersPage() {
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

  // Available orders (READY status, not yet assigned)
  let available: any[] = [];
  try {
    const rows = await db
      .select({
        orderId:         orders.id,
        orderNumber:     orders.orderNumber,
        orderTotal:      orders.total,
        deliveryAddress: orders.deliveryAddress,
        vendorName:      vendors.shopName,
        clientName:      users.name,
      })
      .from(orders)
      .leftJoin(vendors, eq(orders.vendorId, vendors.id))
      .leftJoin(users,   eq(orders.clientId, users.id))
      .where(eq(orders.status, "READY"))
      .orderBy(desc(orders.createdAt))
      .limit(20);

    available = rows.map(r => ({
      ...r,
      deliveryId:    null,
      deliveryCode:  null,
      deliveryStatus:"READY",
      status:        "READY",
      fee:           500,
      assignedAt:    null,
      items:         [],
      vendorAddress: null,
      vendorPhone:   null,
      clientPhone:   (r.deliveryAddress as any)?.phone ?? null,
    }));
  } catch (err) {
    console.error("[orders/available]", err);
  }

  // My active deliveries
  let mine: any[] = [];
  try {
    const rows = await db
      .select({
        deliveryId:      orderDeliveries.id,
        status:          orderDeliveries.status,
        fee:             (orderDeliveries as any).fee,
        assignedAt:      (orderDeliveries as any).assignedAt,
        orderId:         orders.id,
        orderNumber:     orders.orderNumber,
        orderTotal:      orders.total,
        deliveryAddress: orders.deliveryAddress,
        vendorName:      vendors.shopName,
        clientName:      users.name,
      })
      .from(orderDeliveries)
      .leftJoin(orders,  eq(orderDeliveries.orderId, orders.id))
      .leftJoin(vendors, eq(orders.vendorId, vendors.id))
      .leftJoin(users,   eq(orders.clientId, users.id))
      .where(and(
        eq(orderDeliveries.deliveryAgentId, agent.id),
        inArray(orderDeliveries.status, ["ASSIGNED","PICKED_UP","IN_TRANSIT"]),
      ))
      .orderBy(desc((orderDeliveries as any).assignedAt))
      .limit(20);

    mine = rows.map(r => ({
      ...r,
      deliveryCode:  (r as any).deliveryCode ?? null,
      deliveryStatus: r.status,
      items:         [],
      vendorAddress: null,
      vendorPhone:   null,
      clientPhone:   (r.deliveryAddress as any)?.phone ?? null,
    }));
  } catch (err) {
    console.error("[orders/mine]", err);
  }

  return (
    <DeliveryOrdersClient
      available={available}
      mine={mine}
      agentId={agent.id}
    />
  );
}
