import { redirect } from "next/navigation";
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { getServerSession } from "@/lib/auth/helpers";
import { getVendorByUserId, getVendorWallet } from "@/lib/actions/vendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils/cn";

export const revalidate = 0;

const REASON_LABEL: Record<string, string> = {
  SALE:            "Vente",
  COMMISSION:      "Commission",
  ESCROW_RELEASE:  "Libération escrow",
  REFUND:          "Remboursement",
  WITHDRAWAL:      "Retrait",
  ADJUSTMENT:      "Ajustement admin",
};

export default async function VendorWalletPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");
  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor)  redirect("/sign-up/vendor");

  const wallet = await getVendorWallet((session.user as any).id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-poppins font-black text-2xl text-foreground">Portefeuille</h1>
        <p className="text-sm text-muted-foreground font-inter mt-0.5">Vos revenus et transactions</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="ink" padding="md">
          <CardContent>
            <p className="text-white/50 text-xs font-poppins uppercase tracking-wider mb-2">Solde disponible</p>
            <p className="font-poppins font-black text-2xl text-white">{formatPrice(wallet.balance)}</p>
            <Button size="sm" className="mt-4 w-full" variant="default">
              Demander un retrait
            </Button>
          </CardContent>
        </Card>

        <Card variant="honey" padding="md">
          <CardContent>
            <p className="text-honey-700 text-xs font-poppins uppercase tracking-wider mb-2">En escrow</p>
            <p className="font-poppins font-black text-2xl text-honey-800">{formatPrice(wallet.escrow)}</p>
            <p className="text-xs text-honey-600 font-inter mt-2">Libéré après confirmation de livraison</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.transactions.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-inter">Aucune transaction pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallet.transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                  )}>
                    {tx.type === "CREDIT"
                      ? <ArrowDownLeft size={16} className="text-success" />
                      : <ArrowUpRight  size={16} className="text-error"   />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-poppins text-foreground">
                      {REASON_LABEL[tx.reason] ?? tx.reason}
                    </p>
                    <p className="text-xs text-muted-foreground font-inter">
                      {new Date(tx.createdAt).toLocaleDateString("fr-CM", { day:"2-digit", month:"short", year:"numeric" })}
                    </p>
                  </div>
                  <p className={cn(
                    "font-poppins font-bold text-sm shrink-0",
                    tx.type === "CREDIT" ? "text-success-dark" : "text-error"
                  )}>
                    {tx.type === "CREDIT" ? "+" : "-"}{formatPrice(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
