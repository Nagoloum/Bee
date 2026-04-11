import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, users, vendors, walletTransactions, withdrawalRequests, wallets } from "@/lib/db/schema";
import { desc, gte, lte, and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const lines = rows.map(row =>
    keys.map(k => {
      const v = row[k];
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    }).join(",")
  );
  return [header, ...lines].join("\n");
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type      = searchParams.get("type") ?? "orders";
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");

  const fromDate = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 86400000);
  const toDate   = toParam   ? new Date(toParam)   : new Date();

  try {
    let rows: Record<string, any>[] = [];
    let filename = "";

    if (type === "orders") {
      filename = `commandes-${fromDate.toISOString().slice(0,10)}-${toDate.toISOString().slice(0,10)}.csv`;
      const raw = await db
        .select({
          orderNumber:   orders.orderNumber,
          date:          orders.createdAt,
          status:        orders.status,
          paymentStatus: orders.paymentStatus,
          paymentMethod: orders.paymentMethod,
          subtotal:      orders.subtotal,
          deliveryFee:   orders.deliveryFee,
          discount:      orders.discount,
          total:         orders.total,
          couponCode:    orders.couponCode,
          clientName:    users.name,
          clientEmail:   users.email,
          vendorName:    vendors.shopName,
        })
        .from(orders)
        .leftJoin(users,   eq(orders.clientId, users.id))
        .leftJoin(vendors, eq(orders.vendorId, vendors.id))
        .where(and(gte(orders.createdAt, fromDate), lte(orders.createdAt, toDate)))
        .orderBy(desc(orders.createdAt))
        .limit(10000);

      rows = raw.map(r => ({
        "Numéro":          r.orderNumber,
        "Date":            r.date ? new Date(r.date).toLocaleString("fr-CM") : "",
        "Statut":          r.status,
        "Paiement":        r.paymentStatus,
        "Méthode":         r.paymentMethod,
        "Sous-total":      r.subtotal,
        "Livraison":       r.deliveryFee,
        "Réduction":       r.discount,
        "Total":           r.total,
        "Coupon":          r.couponCode ?? "",
        "Client":          r.clientName ?? "",
        "Email client":    r.clientEmail ?? "",
        "Boutique":        r.vendorName ?? "",
      }));
    }

    else if (type === "vendors") {
      filename = `vendeurs-${toDate.toISOString().slice(0,10)}.csv`;
      const raw = await db
        .select({
          shopName:    vendors.shopName,
          email:       users.email,
          status:      vendors.status,
          region:      vendors.region,
          rating:      vendors.rating,
          totalSales:  vendors.totalSales,
          totalReviews:vendors.totalReviews,
          balance:     wallets.balance,
          escrow:      wallets.escrow,
          createdAt:   vendors.createdAt,
        })
        .from(vendors)
        .leftJoin(users,   eq(vendors.userId, users.id))
        .leftJoin(wallets, eq(wallets.userId, vendors.userId))
        .orderBy(desc(vendors.createdAt))
        .limit(5000);

      rows = raw.map(r => ({
        "Boutique":      r.shopName,
        "Email":         r.email ?? "",
        "Statut":        r.status,
        "Région":        r.region ?? "",
        "Note":          r.rating,
        "Ventes":        r.totalSales,
        "Avis":          r.totalReviews,
        "Solde (FCFA)":  r.balance ?? 0,
        "Escrow (FCFA)": r.escrow  ?? 0,
        "Inscrit le":    r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-CM") : "",
      }));
    }

    else if (type === "transactions") {
      filename = `transactions-${fromDate.toISOString().slice(0,10)}-${toDate.toISOString().slice(0,10)}.csv`;
      const raw = await db
        .select({
          id:            walletTransactions.id,
          date:          walletTransactions.createdAt,
          type:          walletTransactions.type,
          amount:        walletTransactions.amount,
          reason:        walletTransactions.reason,
          description:   walletTransactions.description,
          balanceBefore: walletTransactions.balanceBefore,
          balanceAfter:  walletTransactions.balanceAfter,
          referenceId:   walletTransactions.referenceId,
        })
        .from(walletTransactions)
        .where(and(
          gte(walletTransactions.createdAt, fromDate),
          lte(walletTransactions.createdAt, toDate),
        ))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(10000);

      rows = raw.map(r => ({
        "ID":             r.id,
        "Date":           r.date ? new Date(r.date).toLocaleString("fr-CM") : "",
        "Type":           r.type,
        "Montant":        r.amount,
        "Motif":          r.reason,
        "Description":    r.description ?? "",
        "Avant":          r.balanceBefore ?? 0,
        "Après":          r.balanceAfter  ?? 0,
        "Référence":      r.referenceId   ?? "",
      }));
    }

    else if (type === "withdrawals") {
      filename = `retraits-${fromDate.toISOString().slice(0,10)}-${toDate.toISOString().slice(0,10)}.csv`;
      const raw = await db
        .select({
          id:             withdrawalRequests.id,
          date:           withdrawalRequests.createdAt,
          status:         withdrawalRequests.status,
          amount:         withdrawalRequests.amount,
          method:         withdrawalRequests.method,
          accountDetails: withdrawalRequests.accountDetails,
          accountName:    withdrawalRequests.accountName,
          vendorName:     users.name,
          vendorEmail:    users.email,
        })
        .from(withdrawalRequests)
        .leftJoin(users, eq(withdrawalRequests.userId, users.id))
        .where(and(
          gte(withdrawalRequests.createdAt, fromDate),
          lte(withdrawalRequests.createdAt, toDate),
        ))
        .orderBy(desc(withdrawalRequests.createdAt))
        .limit(5000);

      rows = raw.map(r => ({
        "ID":          r.id,
        "Date":        r.date ? new Date(r.date).toLocaleString("fr-CM") : "",
        "Statut":      r.status,
        "Montant":     r.amount,
        "Méthode":     r.method ?? "",
        "Compte":      r.accountDetails ?? "",
        "Bénéficiaire":r.accountName ?? "",
        "Vendeur":     r.vendorName  ?? "",
        "Email":       r.vendorEmail ?? "",
      }));
    }

    else {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 });
    }

    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[admin/export GET]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
