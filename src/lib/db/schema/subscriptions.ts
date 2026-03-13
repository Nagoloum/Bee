import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { vendors, deliveryAgents } from "./vendors";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
  "TRIALING",
]);

export const planTypeEnum = pgEnum("plan_type", [
  "VENDOR_START",
  "VENDOR_PRO",
  "VENDOR_ELITE",
  "DELIVERY_FREELANCE",
  "DELIVERY_PREMIUM",
]);

// ─── Subscription Plans ───────────────────────────────────────────────────────

export const subscriptionPlans = pgTable("subscription_plans", {
  id:                  text("id").primaryKey().$defaultFn(createId),
  type:                planTypeEnum("type").notNull().unique(),
  name:                text("name").notNull(),
  nameEn:              text("name_en"),
  description:         text("description"),
  priceMonthly:        integer("price_monthly").notNull(), // in FCFA (0 = free)
  priceYearly:         integer("price_yearly"),
  stripePriceMonthlyId:text("stripe_price_monthly_id"),
  stripePriceYearlyId: text("stripe_price_yearly_id"),
  features:            jsonb("features").$type<PlanFeature[]>().notNull().default([]),

  // Vendor-specific limits
  maxProducts:         integer("max_products"),   // null = unlimited
  maxPhotosPerProduct: integer("max_photos_per_product").notNull().default(2),
  maxFlashSalesPerDay: integer("max_flash_sales_per_day").notNull().default(0),
  maxCoupons:          integer("max_coupons").notNull().default(0),
  couponMaxDiscount:   integer("coupon_max_discount").notNull().default(0), // %
  hasPrioritySupport:  boolean("has_priority_support").notNull().default(false),
  hasAnalytics:        boolean("has_analytics").notNull().default(false),
  hasRecruitment:      boolean("has_recruitment").notNull().default(false),
  hasBoostedVisibility:boolean("has_boosted_visibility").notNull().default(false),
  referralBonus:       text("referral_bonus"), // description of referral perks

  isActive:            boolean("is_active").notNull().default(true),
  isPopular:           boolean("is_popular").notNull().default(false),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
});

// ─── Vendor Subscriptions ────────────────────────────────────────────────────

export const vendorSubscriptions = pgTable("vendor_subscriptions", {
  id:                    text("id").primaryKey().$defaultFn(createId),
  vendorId:              text("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  planId:                text("plan_id").notNull().references(() => subscriptionPlans.id),
  status:                subscriptionStatusEnum("status").notNull().default("ACTIVE"),
  stripeSubscriptionId:  text("stripe_subscription_id"),
  stripeCustomerId:      text("stripe_customer_id"),
  currentPeriodStart:    timestamp("current_period_start").notNull().defaultNow(),
  currentPeriodEnd:      timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd:     boolean("cancel_at_period_end").notNull().default(false),
  cancelledAt:           timestamp("cancelled_at"),
  trialEndsAt:           timestamp("trial_ends_at"),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
});

// ─── Delivery Agent Subscriptions ────────────────────────────────────────────

export const deliverySubscriptions = pgTable("delivery_subscriptions", {
  id:                    text("id").primaryKey().$defaultFn(createId),
  deliveryAgentId:       text("delivery_agent_id").notNull().references(() => deliveryAgents.id, { onDelete: "cascade" }),
  planId:                text("plan_id").notNull().references(() => subscriptionPlans.id),
  status:                subscriptionStatusEnum("status").notNull().default("ACTIVE"),
  stripeSubscriptionId:  text("stripe_subscription_id"),
  currentPeriodEnd:      timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd:     boolean("cancel_at_period_end").notNull().default(false),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlanFeature = {
  label:    string;
  included: boolean;
  value?:   string;
};

export type SubscriptionPlan      = typeof subscriptionPlans.$inferSelect;
export type VendorSubscription    = typeof vendorSubscriptions.$inferSelect;
export type DeliverySubscription  = typeof deliverySubscriptions.$inferSelect;
