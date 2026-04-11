import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { userBadges, productBadges } from "@/lib/db/schema/badges";
import { desc } from "drizzle-orm";
import { AdminBadgesClient } from "@/components/admin/admin-badges-client";

export const revalidate = 0;

export default async function AdminBadgesPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const [ub, pb] = await Promise.all([
    db.select().from(userBadges).orderBy(desc(userBadges.awardedAt)).limit(100),
    db.select().from(productBadges).orderBy(desc(productBadges.awardedAt)).limit(100),
  ]);

  return (
    <AdminBadgesClient
      userBadges={ub.map(b => ({ ...b, targetId: (b as any).userId }))}
      productBadges={pb.map(b => ({ ...b, targetId: (b as any).productId }))}
    />
  );
}
