"use server";

import { db } from "@/lib/db";
import {
  vendors, products, orders, orderItems, wallets,
  walletTransactions, vendorSubscriptions, subscriptionPlans,
  categories,
} from "@/lib/db/schema";
import { eq, desc, and, gte, count, sum, sql } from "drizzle-orm";

// ─── Get vendor profile by userId ─────────────────────────────────────────────

export async function getVendorByUserId(userId: string) {
  const rows = await db
    .select()
    .from(vendors)
    .where(eq(vendors.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getVendorStats(vendorId: string) {
  const now       = new Date();
  const monthStart= new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrdersRes,
    monthOrdersRes,
    revenueRes,
    monthRevenueRes,
    totalProductsRes,
    pendingOrdersRes,
  ] = await Promise.all([
    // Total orders
    db.select({ count: count() }).from(orders).where(eq(orders.vendorId, vendorId)),
    // This month orders
    db.select({ count: count() }).from(orders).where(
      and(eq(orders.vendorId, vendorId), gte(orders.createdAt, monthStart))
    ),
    // Total revenue (delivered orders)
    db.select({ total: sum(orders.total) }).from(orders).where(
      and(eq(orders.vendorId, vendorId), eq(orders.status, "DELIVERED"))
    ),
    // Month revenue
    db.select({ total: sum(orders.total) }).from(orders).where(
      and(
        eq(orders.vendorId, vendorId),
        eq(orders.status, "DELIVERED"),
        gte(orders.createdAt, monthStart)
      )
    ),
    // Total products published
    db.select({ count: count() }).from(products).where(
      and(eq(products.vendorId, vendorId), eq(products.status, "PUBLISHED"))
    ),
    // Pending orders
    db.select({ count: count() }).from(orders).where(
      and(eq(orders.vendorId, vendorId), eq(orders.status, "PENDING"))
    ),
  ]);

  return {
    totalOrders:    Number(totalOrdersRes[0]?.count ?? 0),
    monthOrders:    Number(monthOrdersRes[0]?.count ?? 0),
    totalRevenue:   Number(revenueRes[0]?.total ?? 0),
    monthRevenue:   Number(monthRevenueRes[0]?.total ?? 0),
    totalProducts:  Number(totalProductsRes[0]?.count ?? 0),
    pendingOrders:  Number(pendingOrdersRes[0]?.count ?? 0),
  };
}

// ─── Get vendor products ───────────────────────────────────────────────────────

export async function getVendorProducts(vendorId: string) {
  return db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      stock:        products.stock,
      status:       products.status,
      rating:       products.rating,
      totalSales:   products.totalSales,
      totalReviews: products.totalReviews,
      isFeatured:   products.isFeatured,
      categoryId:   products.categoryId,
      createdAt:    products.createdAt,
    })
    .from(products)
    .where(eq(products.vendorId, vendorId))
    .orderBy(desc(products.createdAt));
}

// ─── Get vendor orders ─────────────────────────────────────────────────────────

export async function getVendorOrders(vendorId: string, status?: string) {
  const conditions = status && status !== "ALL"
    ? and(eq(orders.vendorId, vendorId), eq(orders.status, status as any))
    : eq(orders.vendorId, vendorId);

  return db
    .select({
      id:          orders.id,
      orderNumber: orders.orderNumber,
      status:      orders.status,
      total:       orders.total,
      clientId:    orders.clientId,
      deliveryAddress: orders.deliveryAddress,
      paymentStatus:   orders.paymentStatus,
      createdAt:   orders.createdAt,
      confirmedAt: orders.confirmedAt,
    })
    .from(orders)
    .where(conditions)
    .orderBy(desc(orders.createdAt))
    .limit(50);
}

// ─── Get vendor wallet ─────────────────────────────────────────────────────────

export async function getVendorWallet(userId: string) {
  const wallet = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet[0]) return { balance: 0, escrow: 0, transactions: [] };

  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.walletId, wallet[0].id))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(20);

  return { ...wallet[0], transactions };
}

// ─── Get vendor subscription ───────────────────────────────────────────────────

export async function getVendorSubscription(vendorId: string) {
  const rows = await db
    .select({
      id:       vendorSubscriptions.id,
      status:   vendorSubscriptions.status,
      periodEnd:vendorSubscriptions.currentPeriodEnd,
      planName: subscriptionPlans.name,
      planType: subscriptionPlans.type,
      maxProducts:   subscriptionPlans.maxProducts,
      maxPhotos:     subscriptionPlans.maxPhotosPerProduct,
      flashPerDay:   subscriptionPlans.maxFlashSalesPerDay,
      maxCoupons:    subscriptionPlans.maxCoupons,
      hasAnalytics:  subscriptionPlans.hasAnalytics,
      hasRecruitment:subscriptionPlans.hasRecruitment,
    })
    .from(vendorSubscriptions)
    .leftJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
    .where(eq(vendorSubscriptions.vendorId, vendorId))
    .limit(1);

  return rows[0] ?? null;
}

// ─── Get all categories (for product form) ────────────────────────────────────

export async function getAllCategories() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.order);
}
