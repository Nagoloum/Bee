import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/helpers";
import { db } from "@/lib/db";
import { wallets, walletTransactions, pointsAccounts, pointsTransactions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ClientWalletClient } from "@/components/storefront/client-wallet-client";

export const revalidate = 0;

export default async function WalletPage() {
  const session = await getServerSession();
  if (!session) redirect("/sign-in");

  const userId = (session.user as any).id;

  // Wallet FCFA
  const [walletRows, pointsRows] = await Promise.all([
    db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
    db.select().from(pointsAccounts).where(eq(pointsAccounts.userId, userId)).limit(1),
  ]);

  const wallet = walletRows[0] ?? { balance: 0, escrow: 0 };
  const points = pointsRows[0] ?? { total: 0, lifetime: 0 };

  // Transactions wallet
  let txHistory: any[] = [];
  if (walletRows[0]) {
    txHistory = await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletRows[0].id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(20);
  }

  // Transactions points
  let ptHistory: any[] = [];
  if (pointsRows[0]) {
    ptHistory = await db.select()
      .from(pointsTransactions)
      .where(eq(pointsTransactions.accountId, pointsRows[0].id))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(20);
  }

  return (
    <ClientWalletClient
      balance={wallet.balance ?? 0}
      escrow={wallet.escrow ?? 0}
      pointsTotal={points.total ?? 0}
      pointsLifetime={points.lifetime ?? 0}
      walletHistory={txHistory}
      pointsHistory={ptHistory}
    />
  );
}
