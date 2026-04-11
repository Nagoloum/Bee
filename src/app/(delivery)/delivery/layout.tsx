import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { DeliveryShell } from "@/components/delivery/delivery-shell";

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["DELIVERY"]);
  if (!session) redirect("/sign-in");

  const user = session.user as any;

  return (
    <DeliveryShell
      userName={user.name ?? "Livreur"}
      userEmail={user.email}
      userId={user.id}
    >
      {children}
    </DeliveryShell>
  );
}
