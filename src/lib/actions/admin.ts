"use server";

import { db } from "@/lib/db";
import {
  users, vendors, orders, products,
  vendorSubscriptions, subscriptionPlans,
  wallets, walletTransactions,
} from "@/lib/db/schema";
import {
  eq, desc, count, sum, sql, and, gte, like, or,
} from "drizzle-orm";

// ─── Global stats ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,     monthUsers,
    totalVendors,   activeVendors,
    totalOrders,    monthOrders,
    revenueTotal,   revenueMonth,
    pendingOrders,  totalProducts,
  ] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(users).where(gte(users.createdAt, monthStart)),
    db.select({ c: count() }).from(vendors),
    db.select({ c: count() }).from(vendors).where(eq(vendors.status, "ACTIVE")),
    db.select({ c: count() }).from(orders),
    db.select({ c: count() }).from(orders).where(gte(orders.createdAt, monthStart)),
    db.select({ s: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, "PAID")),
    db.select({ s: sum(orders.total) }).from(orders).where(
      and(eq(orders.paymentStatus, "PAID"), gte(orders.createdAt, monthStart))
    ),
    db.select({ c: count() }).from(orders).where(eq(orders.status, "PENDING")),
    db.select({ c: count() }).from(products).where(eq(products.status, "PUBLISHED")),
  ]);

  return {
    totalUsers:    Number(totalUsers[0]?.c ?? 0),
    monthUsers:    Number(monthUsers[0]?.c ?? 0),
    totalVendors:  Number(totalVendors[0]?.c ?? 0),
    activeVendors: Number(activeVendors[0]?.c ?? 0),
    totalOrders:   Number(totalOrders[0]?.c ?? 0),
    monthOrders:   Number(monthOrders[0]?.c ?? 0),
    revenueTotal:  Number(revenueTotal[0]?.s ?? 0),
    revenueMonth:  Number(revenueMonth[0]?.s ?? 0),
    pendingOrders: Number(pendingOrders[0]?.c ?? 0),
    totalProducts: Number(totalProducts[0]?.c ?? 0),
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers(search?: string, role?: string, limit = 50) {
  const conditions: any[] = [];
  if (role && role !== "ALL") conditions.push(eq(users.role, role as any));
  if (search) conditions.push(
    or(
      like(users.name,  `%${search}%`),
      like(users.email, `%${search}%`),
    )
  );

  return db.select({
    id:            users.id,
    name:          users.name,
    email:         users.email,
    role:          users.role,
    status:        users.status,
    image:         users.image,
    emailVerified: users.emailVerified,
    phoneVerified: users.phoneVerified,
    createdAt:     users.createdAt,
  })
  .from(users)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(users.createdAt))
  .limit(limit);
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export async function getAdminVendors(search?: string, status?: string) {
  const conditions: any[] = [];
  if (status && status !== "ALL") conditions.push(eq(vendors.status, status as any));
  if (search) conditions.push(like(vendors.shopName, `%${search}%`));

  return db.select({
    id:           vendors.id,
    shopName:     vendors.shopName,
    slug:         vendors.slug,
    region:       vendors.region,
    status:       vendors.status,
    isVerified:   vendors.isVerified,
    rating:       vendors.rating,
    totalSales:   vendors.totalSales,
    totalReviews: vendors.totalReviews,
    logo:         vendors.logo,
    userId:       vendors.userId,
    createdAt:    vendors.createdAt,
  })
  .from(vendors)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(vendors.createdAt))
  .limit(100);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function getAdminOrders(status?: string, limit = 50) {
  const conditions = status && status !== "ALL"
    ? [eq(orders.status, status as any)]
    : [];

  return db.select({
    id:          orders.id,
    orderNumber: orders.orderNumber,
    status:      orders.status,
    paymentStatus: orders.paymentStatus,
    total:       orders.total,
    clientId:    orders.clientId,
    vendorId:    orders.vendorId,
    deliveryAddress: orders.deliveryAddress,
    createdAt:   orders.createdAt,
  })
  .from(orders)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(orders.createdAt))
  .limit(limit);
}

// ─── Products (pending review) ────────────────────────────────────────────────

export async function getAdminProducts(status?: string, limit = 50) {
  const conditions = status && status !== "ALL"
    ? [eq(products.status, status as any)]
    : [];

  return db.select({
    id:        products.id,
    name:      products.name,
    slug:      products.slug,
    images:    products.images,
    basePrice: products.basePrice,
    status:    products.status,
    vendorId:  products.vendorId,
    rating:    products.rating,
    totalSales:products.totalSales,
    createdAt: products.createdAt,
  })
  .from(products)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(products.createdAt))
  .limit(limit);
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getAdminSubscriptions() {
  return db.select({
    id:         vendorSubscriptions.id,
    vendorId:   vendorSubscriptions.vendorId,
    status:     vendorSubscriptions.status,
    periodEnd:  vendorSubscriptions.currentPeriodEnd,
    planName:   subscriptionPlans.name,
    planType:   subscriptionPlans.type,
    planPrice:  subscriptionPlans.priceMonthly,
  })
  .from(vendorSubscriptions)
  .leftJoin(subscriptionPlans, eq(vendorSubscriptions.planId, subscriptionPlans.id))
  .orderBy(desc(vendorSubscriptions.createdAt))
  .limit(100);
}

// ─── Wallets ──────────────────────────────────────────────────────────────────

export async function getAdminWallets() {
  return db.select({
    id:      wallets.id,
    userId:  wallets.userId,
    balance: wallets.balance,
    escrow:  wallets.escrow,
    updatedAt: wallets.updatedAt,
  })
  .from(wallets)
  .orderBy(desc(wallets.balance))
  .limit(100);
}
