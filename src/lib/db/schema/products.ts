import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { vendors } from "./vendors";

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id:          text("id").primaryKey().$defaultFn(createId),
  name:        text("name").notNull(),
  nameEn:      text("name_en"),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
  icon:        text("icon"),
  image:       text("image"),
  color:       text("color"),
  parentId:    text("parent_id").references((): ReturnType<typeof text> => categories.id as any),
  order:       integer("order").notNull().default(0),
  isActive:    boolean("is_active").notNull().default(true),
  isFeatured:  boolean("is_featured").notNull().default(false),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "PENDING_REVIEW",
  "REJECTED",
]);

export const products = pgTable("products", {
  id:             text("id").primaryKey().$defaultFn(createId),
  vendorId:       text("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  categoryId:     text("category_id").references(() => categories.id),
  name:           text("name").notNull(),
  slug:           text("slug").notNull(),
  description:    text("description"),
  shortDesc:      text("short_desc"),
  images:         jsonb("images").$type<string[]>().notNull().default([]),
  basePrice:      integer("base_price").notNull(), // in FCFA (smallest unit)
  comparePrice:   integer("compare_price"),        // original price for crossed-out display
  stock:          integer("stock").notNull().default(0),
  sku:            text("sku"),
  barcode:        text("barcode"),
  weight:         real("weight"),                  // in grams
  tags:           jsonb("tags").$type<string[]>().default([]),
  status:         productStatusEnum("status").notNull().default("DRAFT"),
  isOfficial:     boolean("is_official").notNull().default(false), // from official catalog
  isFeatured:     boolean("is_featured").notNull().default(false),
  hasVariants:    boolean("has_variants").notNull().default(false),
  rating:         real("rating").notNull().default(0),
  totalReviews:   integer("total_reviews").notNull().default(0),
  totalSales:     integer("total_sales").notNull().default(0),
  views:          integer("views").notNull().default(0),
  metaTitle:      text("meta_title"),
  metaDesc:       text("meta_desc"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

// ─── Product Variants ────────────────────────────────────────────────────────

export const productVariants = pgTable("product_variants", {
  id:          text("id").primaryKey().$defaultFn(createId),
  productId:   text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),  // e.g. "Taille / Couleur"
  options:     jsonb("options").$type<VariantOption[]>().notNull().default([]),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Product Variant Combinations ────────────────────────────────────────────

export const productVariantCombinations = pgTable("product_variant_combinations", {
  id:          text("id").primaryKey().$defaultFn(createId),
  productId:   text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  combination: jsonb("combination").$type<Record<string, string>>().notNull(), // {color: "rouge", size: "M"}
  price:       integer("price").notNull(),
  stock:       integer("stock").notNull().default(0),
  sku:         text("sku"),
  image:       text("image"),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Official Catalog (admin-managed reference products) ─────────────────────

export const officialProducts = pgTable("official_products", {
  id:          text("id").primaryKey().$defaultFn(createId),
  categoryId:  text("category_id").references(() => categories.id),
  name:        text("name").notNull(),
  description: text("description"),
  images:      jsonb("images").$type<string[]>().default([]),
  brand:       text("brand"),
  model:       text("model"),
  barcode:     text("barcode"),
  attributes:  jsonb("attributes").$type<Record<string, string>>().default({}),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type VariantOption = {
  label: string;
  value: string;
  color?: string;
};

export type Category                  = typeof categories.$inferSelect;
export type NewCategory               = typeof categories.$inferInsert;
export type Product                   = typeof products.$inferSelect;
export type NewProduct                = typeof products.$inferInsert;
export type ProductVariant            = typeof productVariants.$inferSelect;
export type ProductVariantCombination = typeof productVariantCombinations.$inferSelect;
export type OfficialProduct           = typeof officialProducts.$inferSelect;
