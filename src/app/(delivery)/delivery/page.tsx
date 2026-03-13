import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";

export default async function DeliveryDashboardPage() {
  const session = await requireRole(["DELIVERY", "ADMIN"]);
  if (!session) redirect("/sign-in?callbackUrl=/delivery");

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">🛵</div>
        <h1 className="font-poppins font-bold text-2xl text-foreground mb-2">
          Dashboard Livreur
        </h1>
        <p className="text-muted-foreground font-inter">
          Bonjour {(session.user as any).name} — Phase 6 à venir
        </p>
      </div>
    </div>
  );
}
