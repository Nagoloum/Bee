"use server";

import { db } from "@/lib/db";
import {
  users, vendors, products, orders, orderItems,
  subscriptionPlans, vendorSubscriptions, wallets,
  adminLogs,
} from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, desc, count, sum, gte, and, ilike, or, ne } from "drizzle-orm";

// ─── Platform stats ───────────────────────────────────────────────────────────

export async function getAdminStats() {
  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsersMonth,
    totalVendors, activeVendors,
    totalProducts,
    totalOrders, monthOrders,
    revenueRes, monthRevenueRes,
  ] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(users).where(gte(users.createdAt, monthStart)),
    db.select({ c: count() }).from(vendors),
    db.select({ c: count() }).from(vendors).where(eq(vendors.status, "ACTIVE")),
    db.select({ c: count() }).from(products).where(eq(products.status, "PUBLISHED")),
    db.select({ c: count() }).from(orders),
    db.select({ c: count() }).from(orders).where(gte(orders.createdAt, monthStart)),
    db.select({ t: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, "PAID")),
    db.select({ t: sum(orders.total) }).from(orders).where(
      and(eq(orders.paymentStatus, "PAID"), gte(orders.createdAt, monthStart))
    ),
  ]);

  return {
    totalUsers:     Number(totalUsers[0]?.c    ?? 0),
    newUsersMonth:  Number(newUsersMonth[0]?.c ?? 0),
    totalVendors:   Number(totalVendors[0]?.c   ?? 0),
    activeVendors:  Number(activeVendors[0]?.c  ?? 0),
    totalProducts:  Number(totalProducts[0]?.c  ?? 0),
    totalOrders:    Number(totalOrders[0]?.c    ?? 0),
    monthOrders:    Number(monthOrders[0]?.c    ?? 0),
    totalRevenue:   Number(revenueRes[0]?.t      ?? 0),
    monthRevenue:   Number(monthRevenueRes[0]?.t ?? 0),
  };
}

// ─── Users list ───────────────────────────────────────────────────────────────

export async function getAdminUsers(opts: {
  search?:  string;
  role?:    string;
  status?:  string;
  page?:    number;
  limit?:   number;
} = {}) {
  const { search, role, status, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (role   && role   !== "ALL") conditions.push(eq(users.role,   role as any));
  if (status && status !== "ALL") conditions.push(eq(users.status, status as any));
  if (search) {
    conditions.push(or(
      ilike(users.name,  `%${search}%`),
      ilike(users.email, `%${search}%`),
    ));
  }

  const query = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, total] = await Promise.all([
    db.select({
      id:            users.id,
      name:          users.name,
      email:         users.email,
      image:         users.image,
      role:          users.role,
      status:        users.status,
      emailVerified: users.emailVerified,
      phoneVerified: users.phoneVerified,
      region:        users.region,
      createdAt:     users.createdAt,
    }).from(users)
      .where(query)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ c: count() }).from(users).where(query),
  ]);

  return {
    items: rows,
    total: Number(total[0]?.c ?? 0),
    page,
    totalPages: Math.ceil(Number(total[0]?.c ?? 0) / limit),
  };
}

// ─── Vendors list ─────────────────────────────────────────────────────────────

export async function getAdminVendors(opts: {
  search?:  string;
  status?:  string;
  page?:    number;
  limit?:   number;
} = {}) {
  const { search, status, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status && status !== "ALL") conditions.push(eq(vendors.status, status as any));
  if (search) conditions.push(ilike(vendors.shopName, `%${search}%`));

  const query = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, total] = await Promise.all([
    db.select({
      id:           vendors.id,
      shopName:     vendors.shopName,
      slug:         vendors.slug,
      logo:         vendors.logo,
      region:       vendors.region,
      status:       vendors.status,
      isVerified:   vendors.isVerified,
      isFeatured:   vendors.isFeatured,
      rating:       vendors.rating,
      totalSales:   vendors.totalSales,
      totalReviews: vendors.totalReviews,
      userId:       vendors.userId,
      createdAt:    vendors.createdAt,
    }).from(vendors)
      .where(query)
      .orderBy(desc(vendors.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ c: count() }).from(vendors).where(query),
  ]);

  return {
    items: rows,
    total: Number(total[0]?.c ?? 0),
    page,
    totalPages: Math.ceil(Number(total[0]?.c ?? 0) / limit),
  };
}

// ─── Products list ────────────────────────────────────────────────────────────

export async function getAdminProducts(opts: {
  search?:  string;
  status?:  string;
  page?:    number;
  limit?:   number;
} = {}) {
  const { search, status, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status && status !== "ALL") conditions.push(eq(products.status, status as any));
  if (search) conditions.push(ilike(products.name, `%${search}%`));

  const query = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, total] = await Promise.all([
    db.select({
      id:          products.id,
      name:        products.name,
      slug:        products.slug,
      images:      products.images,
      basePrice:   products.basePrice,
      stock:       products.stock,
      status:      products.status,
      rating:      products.rating,
      totalSales:  products.totalSales,
      vendorId:    products.vendorId,
      isFeatured:  products.isFeatured,
      createdAt:   products.createdAt,
    }).from(products)
      .where(query)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ c: count() }).from(products).where(query),
  ]);

  return {
    items: rows,
    total: Number(total[0]?.c ?? 0),
    page,
    totalPages: Math.ceil(Number(total[0]?.c ?? 0) / limit),
  };
}

// ─── Orders list ──────────────────────────────────────────────────────────────

export async function getAdminOrders(opts: {
  status?:  string;
  page?:    number;
  limit?:   number;
} = {}) {
  const { status, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;

  const query = status && status !== "ALL"
    ? eq(orders.status, status as any)
    : undefined;

  const [rows, total] = await Promise.all([
    db.select().from(orders)
      .where(query)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ c: count() }).from(orders).where(query),
  ]);

  return {
    items: rows,
    total: Number(total[0]?.c ?? 0),
    page,
    totalPages: Math.ceil(Number(total[0]?.c ?? 0) / limit),
  };
}

// ─── Recent activity (admin logs) ─────────────────────────────────────────────

export async function getAdminLogs(limit = 30) {
  return db.select().from(adminLogs)
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit);
}

// ─── Log admin action ─────────────────────────────────────────────────────────

export async function logAdminAction(params: {
  adminId:    string;
  action:     string;
  targetType?: string;
  targetId?:   string;
  details?:   Record<string, unknown>;
}) {
  await db.insert(adminLogs).values({
    id:         createId(),
    adminId:    params.adminId,
    action:     params.action,
    targetType: params.targetType ?? null,
    targetId:   params.targetId ?? null,
    details:    params.details ?? {},
  });
}
