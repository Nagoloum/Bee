import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { disputes, disputeMessages, users, orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminDisputesClient } from "@/components/admin/admin-disputes-client";

export const revalidate = 0;

export default async function AdminDisputesPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const rows = await db
    .select({
      id:          disputes.id,
      status:      disputes.status,
      reason:      disputes.reason,
      description: disputes.description,
      refundAmount:disputes.refundAmount,
      resolution:  disputes.resolution,
      createdAt:   disputes.createdAt,
      updatedAt:   disputes.updatedAt,
      orderId:     disputes.orderId,
      orderNumber: orders.orderNumber,
      orderTotal:  orders.total,
      clientName:  users.name,
      clientEmail: users.email,
    })
    .from(disputes)
    .leftJoin(orders, eq(disputes.orderId, orders.id))
    .leftJoin(users,  eq(disputes.clientId, users.id))
    .orderBy(desc(disputes.createdAt))
    .limit(50);

  return <AdminDisputesClient disputes={rows as any} adminId={(session.user as any).id} />;
}
