import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminStats, getAdminOrders, getAdminUsers } from "@/lib/actions/admin";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in");

  const [stats, recentOrders, recentUsers] = await Promise.all([
    getAdminStats(),
    getAdminOrders(undefined, 8),
    getAdminUsers(undefined, undefined, 6),
  ]);

  return (
    <AdminDashboardClient
      stats={stats}
      recentOrders={recentOrders as any}
      recentUsers={recentUsers as any}
    />
  );
}
