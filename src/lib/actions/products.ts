"use server";

import { db } from "@/lib/db";
import { products, vendors, categories, users } from "@/lib/db/schema";
import { eq, desc, asc, like, and, gte, lte, sql, inArray } from "drizzle-orm";

// ─── Homepage data ────────────────────────────────────────────────────────────

export async function getFeaturedProducts(limit = 8) {
  return db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      totalSales:   products.totalSales,
      stock:        products.stock,
      isFeatured:   products.isFeatured,
      vendorId:     products.vendorId,
      vendorName:   vendors.shopName,
      vendorSlug:   vendors.slug,
      categoryId:   products.categoryId,
    })
    .from(products)
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(and(
      eq(products.status, "PUBLISHED"),
      eq(products.isFeatured, true)
    ))
    .orderBy(desc(products.totalSales))
    .limit(limit);
}

export async function getNewArrivals(limit = 8) {
  return db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      totalSales:   products.totalSales,
      stock:        products.stock,
      vendorName:   vendors.shopName,
      vendorSlug:   vendors.slug,
    })
    .from(products)
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(eq(products.status, "PUBLISHED"))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getTopVendors(limit = 6) {
  return db
    .select({
      id:          vendors.id,
      shopName:    vendors.shopName,
      slug:        vendors.slug,
      logo:        vendors.logo,
      region:      vendors.region,
      rating:      vendors.rating,
      totalSales:  vendors.totalSales,
      totalReviews:vendors.totalReviews,
      isVerified:  vendors.isVerified,
    })
    .from(vendors)
    .where(eq(vendors.status, "ACTIVE"))
    .orderBy(desc(vendors.totalSales))
    .limit(limit);
}

export async function getFeaturedCategories() {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), eq(categories.isFeatured, true)))
    .orderBy(asc(categories.order));
}

// ─── Catalogue with filters ───────────────────────────────────────────────────

export interface ProductFiltersInput {
  category?:  string;
  minPrice?:  number;
  maxPrice?:  number;
  search?:    string;
  sort?:      "newest" | "price_asc" | "price_desc" | "rating" | "popular";
  page?:      number;
  pageSize?:  number;
}

export async function getProducts(filters: ProductFiltersInput = {}) {
  const {
    category, minPrice, maxPrice, search,
    sort = "popular", page = 1, pageSize = 12,
  } = filters;

  const conditions = [eq(products.status, "PUBLISHED")];

  if (category) {
    const cat = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
    if (cat[0]) conditions.push(eq(products.categoryId, cat[0].id));
  }
  if (minPrice) conditions.push(gte(products.basePrice, minPrice));
  if (maxPrice) conditions.push(lte(products.basePrice, maxPrice));
  if (search)   conditions.push(like(products.name, `%${search}%`));

  const orderBy = {
    newest:     desc(products.createdAt),
    price_asc:  asc(products.basePrice),
    price_desc: desc(products.basePrice),
    rating:     desc(products.rating),
    popular:    desc(products.totalSales),
  }[sort];

  const offset = (page - 1) * pageSize;

  const [rows, countResult] = await Promise.all([
    db.select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      totalSales:   products.totalSales,
      stock:        products.stock,
      isFeatured:   products.isFeatured,
      vendorName:   vendors.shopName,
      vendorSlug:   vendors.slug,
      categoryId:   products.categoryId,
    })
    .from(products)
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset),

    db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    items:      rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNext:    page * pageSize < total,
    hasPrev:    page > 1,
  };
}

// ─── Single product ───────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      description:  products.description,
      shortDesc:    products.shortDesc,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      stock:        products.stock,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      totalSales:   products.totalSales,
      hasVariants:  products.hasVariants,
      tags:         products.tags,
      isFeatured:   products.isFeatured,
      categoryId:   products.categoryId,
      vendorId:     products.vendorId,
      vendorName:   vendors.shopName,
      vendorSlug:   vendors.slug,
      vendorLogo:   vendors.logo,
      vendorRegion: vendors.region,
      vendorRating: vendors.rating,
      isVerified:   vendors.isVerified,
    })
    .from(products)
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(and(eq(products.slug, slug), eq(products.status, "PUBLISHED")))
    .limit(1);

  return rows[0] ?? null;
}

// ─── Vendor shop page ─────────────────────────────────────────────────────────

export async function getVendorBySlug(slug: string) {
  const rows = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.slug, slug), eq(vendors.status, "ACTIVE")))
    .limit(1);

  return rows[0] ?? null;
}

export async function getVendorProducts(vendorId: string, limit = 20) {
  return db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      totalSales:   products.totalSales,
      stock:        products.stock,
    })
    .from(products)
    .where(and(eq(products.vendorId, vendorId), eq(products.status, "PUBLISHED")))
    .orderBy(desc(products.totalSales))
    .limit(limit);
}

// ─── Related products ─────────────────────────────────────────────────────────

export async function getRelatedProducts(categoryId: string, excludeSlug: string, limit = 4) {
  return db
    .select({
      id:           products.id,
      name:         products.name,
      slug:         products.slug,
      images:       products.images,
      basePrice:    products.basePrice,
      comparePrice: products.comparePrice,
      rating:       products.rating,
      totalReviews: products.totalReviews,
      stock:        products.stock,
      vendorName:   vendors.shopName,
    })
    .from(products)
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(and(
      eq(products.categoryId, categoryId),
      eq(products.status, "PUBLISHED"),
    ))
    .orderBy(desc(products.totalSales))
    .limit(limit + 1)
    .then(rows => rows.filter(r => r.slug !== excludeSlug).slice(0, limit));
}
