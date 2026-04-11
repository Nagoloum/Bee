import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";

// ─── Platform Settings (singleton row) ───────────────────────────────────────

export const platformSettings = pgTable("platform_settings", {
  id:               text("id").primaryKey().default("main"),
  // Tarifs
  deliveryFeeBase:    integer("delivery_fee_base").notNull().default(500),
  deliveryFeeExpress: integer("delivery_fee_express").notNull().default(1000),
  commissionRate:     integer("commission_rate").notNull().default(10),
  // Plans (copie locale pour affichage, source de vérité billing = subscriptionPlans)
  planProPrice:     integer("plan_pro_price").notNull().default(5000),
  planElitePrice:   integer("plan_elite_price").notNull().default(15000),
  planDeliveryPrem: integer("plan_delivery_prem").notNull().default(3000),
  // Contact
  contactEmail:     text("contact_email").notNull().default("contact@bee.cm"),
  supportPhone:     text("support_phone").notNull().default("+33 6 25 83 90 07"),
  address:          text("address").notNull().default("Cameroun"),
  // Réseaux sociaux
  instagram:        text("instagram").notNull().default("https://instagram.com/beecm"),
  facebook:         text("facebook").notNull().default("https://facebook.com/beecm"),
  twitter:          text("twitter").notNull().default("https://twitter.com/beecm"),
  whatsapp:         text("whatsapp").notNull().default("+237699000000"),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Promo Banners (carousel accueil) ────────────────────────────────────────

export const promoBanners = pgTable("promo_banners", {
  id:          text("id").primaryKey().$defaultFn(createId),
  title:       text("title").notNull(),
  subtitle:    text("subtitle").notNull(),
  cta:         text("cta").notNull(),
  ctaHref:     text("cta_href").notNull(),
  bgColor:     text("bg_color").notNull().default("from-ink-900 to-ink-700"),
  accentColor: text("accent_color").notNull().default("#F6861A"),
  image:       text("image"),
  badge:       text("badge"),
  sortOrder:   integer("sort_order").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type PromoBanner      = typeof promoBanners.$inferSelect;
