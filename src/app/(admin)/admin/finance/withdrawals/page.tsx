import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { withdrawalRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminWithdrawalsClient } from "@/components/admin/admin-withdrawals-client";

export const revalidate = 0;

export default async function AdminWithdrawalsPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const rows = await db
    .select({
      id:             withdrawalRequests.id,
      status:         withdrawalRequests.status,
      amount:         withdrawalRequests.amount,
      method:         withdrawalRequests.method,
      accountDetails: withdrawalRequests.accountDetails,
      accountName:    withdrawalRequests.accountName,
      // ✅ FIX — processingNote (nom correct dans le schéma)
      processingNote: withdrawalRequests.processingNote,
      createdAt:      withdrawalRequests.createdAt,
      processedAt:    withdrawalRequests.processedAt,
      vendorName:     users.name,
      vendorEmail:    users.email,
    })
    .from(withdrawalRequests)
    .leftJoin(users, eq(withdrawalRequests.userId, users.id))
    .orderBy(desc(withdrawalRequests.createdAt))
    .limit(100);

  return <AdminWithdrawalsClient withdrawals={rows as any} />;
}
