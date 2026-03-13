import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";

export default async function AdminDashboardPage() {
  const session = await requireRole(["ADMIN"]);
  if (!session) redirect("/sign-in?callbackUrl=/admin");

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="font-poppins font-bold text-2xl text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-white/60 font-inter">
          Bonjour {(session.user as any).name} — Phase 8 à venir
        </p>
      </div>
    </div>
  );
}
