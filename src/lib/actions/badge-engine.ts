"use server";

import { db } from "@/lib/db";
import { userBadges, productBadges } from "@/lib/db/schema/badges";
import { orders, orderItems, vendors, products, reviews } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, gte, desc, count, sum, avg } from "drizzle-orm";

// ── Helper: upsert badge ───────────────────────────────────────────────────

async function awardUserBadge(userId: string, type: string, expiresAt?: Date) {
  const existing = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.type, type as any), eq(userBadges.isActive, true)))
    .limit(1);

  if (existing[0]) return; // already has it

  await db.insert(userBadges).values({
    id: createId(), userId,
    type: type as any,
    awardedAt: new Date(),
    expiresAt: expiresAt ?? null,
    isActive: true,
  });
}

async function awardProductBadge(productId: string, type: string, expiresAt?: Date) {
  // Expire old one of same type first
  await db.update(productBadges)
    .set({ isActive: false })
    .where(and(eq(productBadges.type, type as any), eq(productBadges.isActive, true)));

  await db.insert(productBadges).values({
    id: createId(), productId,
    type: type as any,
    awardedAt: new Date(),
    expiresAt: expiresAt ?? null,
    isActive: true,
  });
}

// ── Weekly cron: runs every Monday ────────────────────────────────────────

export async function runWeeklyBadgeCron() {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const nextWeek = new Date(Date.now() + 7 * 86400000);

  try {
    // ── 1. BEST_VENDOR_WEEK ─────────────────────────────────────────────
    const vendorSales = await db
      .select({
        vendorId: orders.vendorId,
        total:    sum(orders.total),
        cnt:      count(),
      })
      .from(orders)
      .where(and(
        gte(orders.createdAt, weekAgo),
        eq(orders.status, "DELIVERED"),
      ))
      .groupBy(orders.vendorId)
      .orderBy(desc(sum(orders.total)))
      .limit(3);

    // Expire previous week's badge
    await db.update(userBadges)
      .set({ isActive: false })
      .where(and(eq(userBadges.type, "BEST_VENDOR_WEEK"), eq(userBadges.isActive, true)));

    for (const v of vendorSales) {
      // Get vendor userId from vendorId
      const vendor = await db.select({ userId: vendors.userId })
        .from(vendors).where(eq(vendors.id, v.vendorId)).limit(1);
      if (vendor[0]) {
        await db.insert(userBadges).values({
          id: createId(),
          userId: vendor[0].userId,
          type: "BEST_VENDOR_WEEK",
          awardedAt: new Date(),
          expiresAt: nextWeek,
          isActive: true,
          note: `Semaine du ${weekAgo.toLocaleDateString("fr-CM")}`,
        });
      }
    }

    // ── 2. BEST_PRODUCT_WEEK ────────────────────────────────────────────
    const productSales = await db
      .select({
        productId: orderItems.productId,
        qty:       sum(orderItems.quantity),
      })
      .from(orderItems)
      .where(gte(orderItems.createdAt, weekAgo))
      .groupBy(orderItems.productId)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(5);

    for (const p of productSales) {
      if (p.productId) {
        await awardProductBadge(p.productId, "BEST_PRODUCT_WEEK", nextWeek);
      }
    }

    // ── 3. TOP_RATED products (≥ 4.8 avg, ≥ 20 reviews) ───────────────
    const topRated = await db
      .select({
        productId: reviews.targetId,
        avgRating: avg(reviews.rating),
        cnt:       count(),
      })
      .from(reviews)
      .where(eq(reviews.targetType, "PRODUCT"))
      .groupBy(reviews.targetId)
      .having(and(
        gte(avg(reviews.rating), 4.8),
        gte(count(), 20),
      ))
      .limit(20);

    for (const p of topRated) {
      const existing = await db.select().from(productBadges)
        .where(and(
          eq(productBadges.productId, p.productId),
          eq(productBadges.type, "TOP_RATED"),
          eq(productBadges.isActive, true),
        )).limit(1);
      if (!existing[0]) {
        await db.insert(productBadges).values({
          id: createId(), productId: p.productId,
          type: "TOP_RATED", awardedAt: new Date(), isActive: true,
        });
      }
    }

    console.log("[badge-engine] Weekly cron complete");
  } catch (err) {
    console.error("[badge-engine] Error:", err);
  }
}

// ── On-demand: check & award threshold badges for a user ──────────────────

export async function checkAndAwardUserBadges(userId: string) {
  try {
    // TRUSTED_BUYER: 10+ delivered orders
    const buyerOrders = await db
      .select({ cnt: count() })
      .from(orders)
      .where(and(eq(orders.clientId, userId), eq(orders.status, "DELIVERED")));

    if ((buyerOrders[0]?.cnt ?? 0) >= 10) {
      await awardUserBadge(userId, "TRUSTED_BUYER");
    }
    if ((buyerOrders[0]?.cnt ?? 0) >= 50) {
      await awardUserBadge(userId, "VIP_BUYER");
    }
  } catch (err) {
    console.error("[badge-engine] checkUser:", err);
  }
}

// ── On-demand: check vendor badges ────────────────────────────────────────

export async function checkAndAwardVendorBadges(vendorId: string, userId: string) {
  try {
    // FAST_SHIPPER: avg dispatch time < 24h on last 50 orders
    // (simplified: if vendor has 50+ delivered orders → award)
    const vendorStats = await db
      .select({ cnt: count(), total: sum(orders.total) })
      .from(orders)
      .where(and(eq(orders.vendorId, vendorId), eq(orders.status, "DELIVERED")));

    if ((vendorStats[0]?.cnt ?? 0) >= 50) {
      await awardUserBadge(userId, "FAST_SHIPPER");
    }
  } catch (err) {
    console.error("[badge-engine] checkVendor:", err);
  }
}

// ── Admin: manually award badge ────────────────────────────────────────────

export async function adminAwardBadge(params: {
  targetId:   string;   // userId or productId
  targetType: "USER" | "PRODUCT";
  type:       string;
  adminId:    string;
  note?:      string;
  expiresAt?: Date;
}) {
  const { targetId, targetType, type, adminId, note, expiresAt } = params;

  if (targetType === "USER") {
    const existing = await db.select().from(userBadges)
      .where(and(eq(userBadges.userId, targetId), eq(userBadges.type, type as any), eq(userBadges.isActive, true)))
      .limit(1);
    if (existing[0]) return { success: false, error: "Badge déjà attribué." };

    await db.insert(userBadges).values({
      id: createId(), userId: targetId,
      type: type as any, awardedAt: new Date(),
      expiresAt: expiresAt ?? null,
      awardedBy: adminId,
      note: note ?? null,
      isActive: true,
    });
  } else {
    await db.insert(productBadges).values({
      id: createId(), productId: targetId,
      type: type as any, awardedAt: new Date(),
      expiresAt: expiresAt ?? null,
      awardedBy: adminId,
      isActive: true,
    });
  }
  return { success: true };
}

// ── Admin: revoke badge ────────────────────────────────────────────────────

export async function adminRevokeBadge(badgeId: string, targetType: "USER" | "PRODUCT") {
  if (targetType === "USER") {
    await db.update(userBadges).set({ isActive: false }).where(eq(userBadges.id, badgeId));
  } else {
    await db.update(productBadges).set({ isActive: false }).where(eq(productBadges.id, badgeId));
  }
  return { success: true };
}
