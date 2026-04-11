import { redirect } from "next/navigation";
import { TrendingUp, ArrowDownLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorWallet } from "@/lib/actions/vendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils/cn";
import { VendorWalletClient } from "@/components/vendor/vendor-wallet-client";

export const revalidate = 0;

const REASON_LABEL: Record<string, string> = {
  SALE:            "Vente",
  COMMISSION:      "Commission",
  ESCROW_RELEASE:  "Libération escrow",
  REFUND:          "Remboursement",
  WITHDRAWAL:      "Retrait",
  ADJUSTMENT:      "Ajustement admin",
  DELIVERY_FEE:    "Frais livraison",
};

export default async function VendorWalletPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const wallet = await getVendorWallet((session.user as any).id);

  return (
    <VendorWalletClient
      balance={wallet.balance ?? 0}
      escrow={wallet.escrow ?? 0}
      transactions={wallet.transactions as any}
    />
  );
}
