import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { users } from "./users";
import { vendors } from "./vendors";
import { products } from "./products";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const couponTypeEnum = pgEnum("coupon_type", [
  "PERCENT",
  "FIXED",
  "FREE_DELIVERY",
]);

export const referralTypeEnum = pgEnum("referral_type", [
  "CLIENT_TO_CLIENT",
  "VENDOR_TO_VENDOR",
  "CLIENT_FAMILY_BADGE",
]);

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const coupons = pgTable("coupons", {
  id:             text("id").primaryKey().$defaultFn(createId),
  vendorId:       text("vendor_id").references(() => vendors.id, { onDelete: "cascade" }),
  code:           text("code").notNull().unique(),
  type:           couponTypeEnum("type").notNull().default("PERCENT"),
  value:          integer("value").notNull(),           // % or FCFA amount
  minOrderAmount: integer("min_order_amount").default(0),
  maxDiscount:    integer("max_discount"),              // max FCFA discount for PERCENT type
  usageLimit:     integer("usage_limit"),               // null = unlimited
  usedCount:      integer("used_count").notNull().default(0),
  isActive:       boolean("is_active").notNull().default(true),
  expiresAt:      timestamp("expires_at"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

// ─── Coupon Usages ────────────────────────────────────────────────────────────

export const couponUsages = pgTable("coupon_usages", {
  id:        text("id").primaryKey().$defaultFn(createId),
  couponId:  text("coupon_id").notNull().references(() => coupons.id),
  userId:    text("user_id").notNull().references(() => users.id),
  orderId:   text("order_id").notNull(),
  discount:  integer("discount").notNull(),
  usedAt:    timestamp("used_at").notNull().defaultNow(),
});

// ─── Flash Sales ──────────────────────────────────────────────────────────────

export const flashSales = pgTable("flash_sales", {
  id:            text("id").primaryKey().$defaultFn(createId),
  vendorId:      text("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  productId:     text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  discountPercent:integer("discount_percent").notNull(), // e.g. 30 = -30%
  originalPrice: integer("original_price").notNull(),
  flashPrice:    integer("flash_price").notNull(),
  stock:         integer("stock").notNull(),              // max items for flash sale
  sold:          integer("sold").notNull().default(0),
  startAt:       timestamp("start_at").notNull(),
  endAt:         timestamp("end_at").notNull(),
  isActive:      boolean("is_active").notNull().default(true),
  notifSent:     boolean("notif_sent").notNull().default(false),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
});

// ─── Referrals ────────────────────────────────────────────────────────────────

export const referrals = pgTable("referrals", {
  id:              text("id").primaryKey().$defaultFn(createId),
  referrerId:      text("referrer_id").notNull().references(() => users.id),
  referredId:      text("referred_id").notNull().references(() => users.id),
  type:            referralTypeEnum("type").notNull(),
  rewardGiven:     boolean("reward_given").notNull().default(false),
  rewardType:      text("reward_type"),     // "free_delivery" | "discount_half" | "free_month"
  rewardValue:     integer("reward_value"), // amount if applicable
  createdAt:       timestamp("created_at").notNull().defaultNow(),
});

// ─── Points (Gamification) ────────────────────────────────────────────────────

export const pointsAccounts = pgTable("points_accounts", {
  id:        text("id").primaryKey().$defaultFn(createId),
  userId:    text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  total:     integer("total").notNull().default(0),     // current balance
  lifetime:  integer("lifetime").notNull().default(0),  // all-time earned
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pointsTransactions = pgTable("points_transactions", {
  id:          text("id").primaryKey().$defaultFn(createId),
  accountId:   text("account_id").notNull().references(() => pointsAccounts.id, { onDelete: "cascade" }),
  amount:      integer("amount").notNull(),             // positive = earn, negative = spend
  reason:      text("reason").notNull(),
  referenceId: text("reference_id"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Job Listings (Vendor Recruitment) ────────────────────────────────────────

export const jobTypeEnum = pgEnum("job_type", [
  "STAGE",
  "CDI",
  "CDD",
  "INTERIM",
  "FREELANCE",
]);

export const jobListings = pgTable("job_listings", {
  id:          text("id").primaryKey().$defaultFn(createId),
  vendorId:    text("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  type:        jobTypeEnum("type").notNull(),
  location:    text("location"),
  salary:      text("salary"),
  deadline:    timestamp("deadline"),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id:          text("id").primaryKey().$defaultFn(createId),
  jobId:       text("job_id").notNull().references(() => jobListings.id, { onDelete: "cascade" }),
  applicantId: text("applicant_id").notNull().references(() => users.id),
  message:     text("message"),
  cvUrl:       text("cv_url"),
  status:      text("status").notNull().default("PENDING"), // PENDING | REVIEWED | ACCEPTED | REJECTED
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Coupon            = typeof coupons.$inferSelect;
export type FlashSale         = typeof flashSales.$inferSelect;
export type Referral          = typeof referrals.$inferSelect;
export type PointsAccount     = typeof pointsAccounts.$inferSelect;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type JobListing        = typeof jobListings.$inferSelect;
export type JobApplication    = typeof jobApplications.$inferSelect;
