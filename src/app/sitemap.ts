import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, vendors, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://bee.cm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Pages statiques ────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/products`,    lastModified: now, changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/shops`,       lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/categories`,  lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/flash-sales`, lastModified: now, changeFrequency: "hourly",  priority: 0.8 },
    { url: `${BASE}/jobs`,        lastModified: now, changeFrequency: "daily",   priority: 0.6 },
    { url: `${BASE}/referral`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sign-in`,     lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/sign-up`,     lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // ── Produits publiés ────────────────────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.status, "PUBLISHED"))
      .limit(5000);

    productPages = rows.map(p => ({
      url:             `${BASE}/products/${p.slug}`,
      lastModified:    p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority:        0.7,
    }));
  } catch {}

  // ── Boutiques actives ───────────────────────────────────────────────────────
  let shopPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ slug: vendors.slug, updatedAt: vendors.updatedAt })
      .from(vendors)
      .where(eq(vendors.status, "ACTIVE"))
      .limit(1000);

    shopPages = rows.map(v => ({
      url:             `${BASE}/shops/${v.slug}`,
      lastModified:    v.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority:        0.6,
    }));
  } catch {}

  // ── Catégories ─────────────────────────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(eq(categories.isActive, true));

    categoryPages = rows.map(c => ({
      url:             `${BASE}/products?category=${c.slug}`,
      lastModified:    c.updatedAt ?? now,
      changeFrequency: "daily" as const,
      priority:        0.6,
    }));
  } catch {}

  return [...staticPages, ...productPages, ...shopPages, ...categoryPages];
}
