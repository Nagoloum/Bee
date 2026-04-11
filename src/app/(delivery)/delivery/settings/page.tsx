import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { deliveryAgents, wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DeliverySettingsClient } from "@/components/delivery/delivery-settings-client";

export const revalidate = 0;

export default async function DeliverySettingsPage() {
  const session = await requireRole(["DELIVERY"]);
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;
  const [agentRows, walletRows] = await Promise.all([
    db.select().from(deliveryAgents).where(eq(deliveryAgents.userId, userId)).limit(1),
    db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
  ]);
  if (!agentRows[0]) redirect("/delivery");
  const agent = agentRows[0];
  return (
    <DeliverySettingsClient
      agentId={agent.id} userId={userId}
      userName={(session.user as any).name ?? ""} email={(session.user as any).email ?? ""}
      stats={{
        totalDeliveries: agent.totalDeliveries ?? 0,
        successDeliveries: agent.successDeliveries ?? 0,
        failedDeliveries: agent.failedDeliveries ?? 0,
        rating: agent.rating ?? 5,
        balance: walletRows[0]?.balance ?? 0,
        hasBadge: agent.hasBadge ?? false,
        vehicleType: (agent as any).vehicleType ?? null,
        vehiclePlate: (agent as any).vehiclePlate ?? null,
        paymentMethod: (agent as any).paymentMethod ?? null,
        paymentDetails: (agent as any).paymentDetails ?? null,
        paymentName: (agent as any).paymentName ?? null,
        bio: (agent as any).bio ?? null,
      }}
    />
  );
}
