import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { getAdminStats } from "@/lib/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in?callbackUrl=/admin");

  const stats = await getAdminStats();
  const user  = session.user as any;

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, image: user.image }}
      pendingOrders={stats.pendingOrders}
    >
      {children}
    </AdminShell>
  );
}
