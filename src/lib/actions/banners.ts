"use server";

import { db } from "@/lib/db";
import { promoBanners } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { BannerSlide } from "@/components/storefront/promo-carousel";

// Returns active banners from DB, mapped to BannerSlide format
// Falls back to empty array (carousel will use its default PROMO_BANNERS prop)
export async function getActiveBanners(): Promise<BannerSlide[]> {
  try {
    const rows = await db
      .select()
      .from(promoBanners)
      .where(eq(promoBanners.isActive, true))
      .orderBy(asc(promoBanners.sortOrder));

    if (rows.length === 0) return [];

    return rows.map(b => ({
      id:          b.id,
      title:       b.title,
      subtitle:    b.subtitle,
      cta:         b.cta,
      ctaHref:     b.ctaHref,
      bgColor:     b.bgColor,
      accentColor: b.accentColor,
      image:       b.image  ?? undefined,
      badge:       b.badge  ?? undefined,
    }));
  } catch (err) {
    console.error("[getActiveBanners]", err);
    return [];
  }
}
