import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendorSubscriptions, subscriptionPlans, vendors } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/subscriptions/grant
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { vendorId, planType, durationMonths = 1, reason } = await req.json();

  if (!vendorId || !planType) {
    return NextResponse.json({ error: "vendorId et planType requis." }, { status: 400 });
  }

  try {
    // Vérifier que le vendeur existe
    const vendor = await db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
    if (!vendor[0]) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

    // Récupérer le plan
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.type, planType as any)).limit(1);
    if (!plan[0]) return NextResponse.json({ error: "Plan introuvable." }, { status: 404 });

    const now   = new Date();
    const end   = new Date(now);
    end.setMonth(end.getMonth() + Number(durationMonths));

    // Désactiver l'abonnement actif si existant
    await db.update(vendorSubscriptions)
      .set({ status: "CANCELLED", cancelledAt: now, updatedAt: now } as any)
      .where(eq(vendorSubscriptions.vendorId, vendorId));

    // Créer le nouvel abonnement gratuit
    const [sub] = await db.insert(vendorSubscriptions).values({
      id:                   createId(),
      vendorId,
      planId:               plan[0].id,
      status:               "ACTIVE",
      currentPeriodStart:   now,
      currentPeriodEnd:     end,
      cancelAtPeriodEnd:    true, // expire automatiquement
      // Note admin dans stripeSubscriptionId (hack propre)
      stripeSubscriptionId: `admin_grant_${(admin.user as any).id}_${reason?.slice(0,20) ?? "gratuit"}`,
    }).returning();

    return NextResponse.json({
      success: true,
      subscription: sub,
      vendorName:   vendor[0].shopName,
      planName:     plan[0].name,
      expiresAt:    end.toISOString(),
    });
  } catch (err) {
    console.error("[admin/subscriptions/grant]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
