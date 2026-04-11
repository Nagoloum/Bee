import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";

export const userRoleEnum = pgEnum("user_role", [
  "CLIENT", "VENDOR", "DELIVERY", "ADMIN",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE", "SUSPENDED", "PENDING", "BANNED",
]);

export const users = pgTable("users", {
  id:               text("id").primaryKey().$defaultFn(createId),
  name:             text("name").notNull(),
  email:            text("email").notNull().unique(),
  emailVerified:    boolean("email_verified").notNull().default(false),
  image:            text("image"),
  phone:            text("phone"),
  phoneVerified:    boolean("phone_verified").notNull().default(false),
  role:             userRoleEnum("role").notNull().default("CLIENT"),
  status:           userStatusEnum("status").notNull().default("ACTIVE"),
  region:           text("region"),
  referralCode:     text("referral_code").unique(),
  // ✅ 2FA TOTP
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorSecret:  text("two_factor_secret"),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id:        text("id").primaryKey().$defaultFn(createId),
  expiresAt: timestamp("expires_at").notNull(),
  token:     text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id:                    text("id").primaryKey().$defaultFn(createId),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  userId:                text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  idToken:               text("id_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  password:              text("password"),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id:         text("id").primaryKey().$defaultFn(createId),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
});

export const deliveryAddresses = pgTable("delivery_addresses", {
  id:        text("id").primaryKey().$defaultFn(createId),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label:     text("label").notNull().default("Domicile"),
  fullName:  text("full_name").notNull(),
  phone:     text("phone").notNull(),
  street:    text("street").notNull(),
  city:      text("city").notNull(),
  region:    text("region").notNull(),
  country:   text("country").notNull().default("CM"),
  notes:     text("notes"),
  lat:       text("lat"),
  lng:       text("lng"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User            = typeof users.$inferSelect;
export type NewUser         = typeof users.$inferInsert;
export type Session         = typeof sessions.$inferSelect;
export type Account         = typeof accounts.$inferSelect;
export type DeliveryAddress = typeof deliveryAddresses.$inferSelect;
export type UserRole        = "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN";
