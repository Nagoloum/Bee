import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { deliveryAgents, orderDeliveries, orders, vendors, users } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { DeliveryDashboardHome } from "@/components/delivery/delivery-dashboard-home";

export const revalidate = 0;

export default async function DeliveryPage() {
  const session = await requireRole(["DELIVERY"]);
  if (!session) redirect("/sign-in");

  const userId = (session.user as any).id;

  const agentRows = await db
    .select()
    .from(deliveryAgents)
    .where(eq(deliveryAgents.userId, userId))
    .limit(1);

  if (!agentRows[0]) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-white/40 font-inter text-sm">
          Profil livreur non trouvé. Contactez l&apos;admin.
        </p>
      </div>
    );
  }
  const agent = agentRows[0];

  // ✅ Only columns that exist in orderDeliveries schema:
  // id, orderId, deliveryAgentId, status, fee, assignedAt, pickedUpAt, deliveredAt, failedAt
  // NO deliveryCode, NO deliveryCode in schema
  let active: any[] = [];
  try {
    const rows = await db
      .select({
        deliveryId:      orderDeliveries.id,
        status:          orderDeliveries.status,
        fee:             orderDeliveries.fee,
        assignedAt:      orderDeliveries.assignedAt,
        orderId:         orders.id,
        orderNumber:     orders.orderNumber,
        orderTotal:      orders.total,
        deliveryAddress: orders.deliveryAddress,
        vendorName:      vendors.shopName,
        vendorAddress:   vendors.address,
        clientName:      users.name,
      })
      .from(orderDeliveries)
      .leftJoin(orders,  eq(orderDeliveries.orderId,  orders.id))
      .leftJoin(vendors, eq(orders.vendorId,           vendors.id))
      .leftJoin(users,   eq(orders.clientId,           users.id))
      .where(and(
        eq(orderDeliveries.deliveryAgentId, agent.id),
        eq(orderDeliveries.status, "ASSIGNED"),
      ))
      .orderBy(desc(orderDeliveries.assignedAt))
      .limit(10);

    active = rows.map(r => ({
      ...r,
      // deliveryCode generated from orderId for display (not stored in DB)
      deliveryCode:  r.orderId.slice(-6).toUpperCase(),
      vendorPhone:   null,
      clientPhone:   (r.deliveryAddress as any)?.phone ?? null,
    }));
  } catch (err) {
    console.error("[delivery/page] query error:", err);
    active = [];
  }

  // Weekly count: use deliveredAt since there's no separate weekly filter column
  let weeklyCount = 0;
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const all = await db
      .select({ cnt: count() })
      .from(orderDeliveries)
      .where(and(
        eq(orderDeliveries.deliveryAgentId, agent.id),
        eq(orderDeliveries.status, "DELIVERED"),
      ));
    weeklyCount = all[0]?.cnt ?? 0;
  } catch {}

  return (
    <DeliveryDashboardHome
      agent={agent as any}
      activeDeliveries={active}
      weeklyDeliveries={weeklyCount}
    />
  );
}
