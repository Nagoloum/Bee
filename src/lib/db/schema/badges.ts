import { pgTable, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
// ✅ FIX — import createId manquant dans la version livrée
import { createId } from "../utils";
import { users } from "./users";

// ── Enums ──────────────────────────────────────────────────────────────────

export const badgeTypeEnum = pgEnum("badge_type", [
  // User badges
  "CERTIFIED",
  "TRUSTED_BUYER",
  "VIP_BUYER",
  // Vendor badges
  "TOP_SELLER",
  "BEST_VENDOR_WEEK",
  "VERIFIED_VENDOR",
  "FAST_SHIPPER",
  "PREMIUM_VENDOR",
  // Product badges
  "BEST_PRODUCT_WEEK",
  "TRENDING",
  "EDITORS_CHOICE",
  "TOP_RATED",
  // Delivery badges
  "RELIABLE_DELIVERY",
  "TOP_DELIVERY",
]);

export const verificationTypeEnum = pgEnum("verification_type", [
  "EMAIL", "PHONE",
]);

export const otpPurposeEnum = pgEnum("otp_purpose", [
  "VERIFY_EMAIL", "VERIFY_PHONE", "LOGIN", "RESET_PASSWORD",
]);

// ── OTP codes ─────────────────────────────────────────────────────────────

export const otpCodes = pgTable("otp_codes", {
  // ✅ FIX — ajout de $defaultFn(createId) manquant
  id:         text("id").primaryKey().$defaultFn(createId),
  userId:     text("user_id").references(() => users.id, { onDelete: "cascade" }),
  target:     text("target").notNull(),
  code:       text("code").notNull(),
  purpose:    otpPurposeEnum("purpose").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  usedAt:     timestamp("used_at"),
  attempts:   integer("attempts").default(0),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ── User verifications ─────────────────────────────────────────────────────

export const userVerifications = pgTable("user_verifications", {
  // ✅ FIX — ajout de $defaultFn(createId) manquant
  id:              text("id").primaryKey().$defaultFn(createId),
  userId:          text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailVerified:   boolean("email_verified").default(false),
  phoneVerified:   boolean("phone_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
});

// ── User badges ────────────────────────────────────────────────────────────

export const userBadges = pgTable("user_badges", {
  // ✅ FIX — ajout de $defaultFn(createId) manquant
  id:        text("id").primaryKey().$defaultFn(createId),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:      badgeTypeEnum("type").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  awardedBy: text("awarded_by"),
  note:      text("note"),
  isActive:  boolean("is_active").default(true),
});

// ── Product badges ─────────────────────────────────────────────────────────

export const productBadges = pgTable("product_badges", {
  // ✅ FIX — ajout de $defaultFn(createId) manquant
  id:        text("id").primaryKey().$defaultFn(createId),
  productId: text("product_id").notNull(),
  type:      badgeTypeEnum("type").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  awardedBy: text("awarded_by"),
  isActive:  boolean("is_active").default(true),
});
