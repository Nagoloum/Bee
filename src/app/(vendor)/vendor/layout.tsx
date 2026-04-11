import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId } from "@/lib/actions/vendor";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";
import { VendorTopbar } from "@/components/vendor/vendor-topbar";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/sign-in?callbackUrl=/vendor");

  const user = session.user as any;
  if (user.role !== "VENDOR" && user.role !== "ADMIN") {
    redirect("/");
  }

  const vendor = await getVendorByUserId(user.id);
  if (!vendor && user.role === "VENDOR") redirect("/sign-up/vendor");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <VendorSidebar vendor={vendor} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <VendorTopbar user={user} vendor={vendor} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
