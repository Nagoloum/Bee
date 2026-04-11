import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { deliveryAgents, orderDeliveries, orders, vendors } from "@/lib/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { DeliveryHistoryClient } from "@/components/delivery/delivery-history-client";

export const revalidate = 0;

export default async function DeliveryHistoryPage() {
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

  const history = await db
    .select({
      deliveryId:   orderDeliveries.id,
      status:       orderDeliveries.status,
      fee:          orderDeliveries.fee,
      assignedAt:   orderDeliveries.assignedAt,
      deliveredAt:  orderDeliveries.deliveredAt,
      failedAt:     orderDeliveries.failedAt,
      failReason:   orderDeliveries.failReason,
      ratingByClient: orderDeliveries.ratingByClient,
      reviewByClient: orderDeliveries.reviewByClient,
      orderId:      orders.id,
      orderNumber:  orders.orderNumber,
      orderTotal:   orders.total,
      deliveryAddress: orders.deliveryAddress,
      vendorName:   vendors.shopName,
    })
    .from(orderDeliveries)
    .leftJoin(orders,  eq(orderDeliveries.orderId, orders.id))
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .where(and(
      eq(orderDeliveries.deliveryAgentId, agent.id),
      or(
        eq(orderDeliveries.status, "DELIVERED"),
        eq(orderDeliveries.status, "FAILED"),
        eq(orderDeliveries.status, "RETURNED"),
      ),
    ))
    .orderBy(desc(orderDeliveries.assignedAt))
    .limit(50);

  return (
    <DeliveryHistoryClient
      history={history as any}
      totalDeliveries={agent.totalDeliveries}
      successDeliveries={agent.successDeliveries}
      failedDeliveries={agent.failedDeliveries}
    />
  );
}
