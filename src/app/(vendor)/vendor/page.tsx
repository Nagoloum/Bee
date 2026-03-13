import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";

export default async function VendorDashboardPage() {
  const session = await requireRole(["VENDOR", "ADMIN"]);
  if (!session) redirect("/sign-in?callbackUrl=/vendor");

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🏪</div>
        <h1 className="font-poppins font-bold text-2xl text-white mb-2">
          Dashboard Vendeur
        </h1>
        <p className="text-white/60 font-inter">
          Bonjour {(session.user as any).name} — Phase 4 à venir
        </p>
      </div>
    </div>
  );
}
