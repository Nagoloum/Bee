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
import { users } from "./users";
import { orders } from "./orders";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const reviewTargetEnum = pgEnum("review_target", [
  "PRODUCT",
  "VENDOR",
  "DELIVERY",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED_CLIENT",   // resolved in favor of client
  "RESOLVED_VENDOR",   // resolved in favor of vendor
  "RESOLVED_PARTIAL",  // partial refund
  "CLOSED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER_NEW",
  "ORDER_STATUS_CHANGE",
  "DELIVERY_ASSIGNED",
  "DELIVERY_STATUS",
  "PAYMENT_RECEIVED",
  "FLASH_SALE_START",
  "COUPON_EXPIRING",
  "REVIEW_RECEIVED",
  "DISPUTE_UPDATE",
  "SUBSCRIPTION_EXPIRING",
  "REFERRAL_REWARD",
  "SYSTEM",
  "PROMO",
]);

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id:           text("id").primaryKey().$defaultFn(createId),
  clientId:     text("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetId:     text("target_id").notNull(), // productId, vendorId, or deliveryAgentId
  targetType:   reviewTargetEnum("target_type").notNull(),
  orderId:      text("order_id").references(() => orders.id),
  rating:       integer("rating").notNull(),  // 1-5
  comment:      text("comment"),
  images:       jsonb("images").$type<string[]>().default([]),
  isVerified:   boolean("is_verified").notNull().default(false),
  vendorReply:  text("vendor_reply"),
  repliedAt:    timestamp("replied_at"),
  isHidden:     boolean("is_hidden").notNull().default(false),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

// ─── Disputes ────────────────────────────────────────────────────────────────

export const disputes = pgTable("disputes", {
  id:           text("id").primaryKey().$defaultFn(createId),
  orderId:      text("order_id").notNull().references(() => orders.id),
  clientId:     text("client_id").notNull().references(() => users.id),
  vendorId:     text("vendor_id").notNull().references(() => users.id),
  status:       disputeStatusEnum("status").notNull().default("OPEN"),
  reason:       text("reason").notNull(),
  description:  text("description"),
  evidence:     jsonb("evidence").$type<string[]>().default([]),
  refundAmount: integer("refund_amount"),
  resolution:   text("resolution"),
  resolvedBy:   text("resolved_by").references(() => users.id),
  resolvedAt:   timestamp("resolved_at"),
  autoFlagCount:integer("auto_flag_count").notNull().default(0),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});

// ─── Dispute Messages ────────────────────────────────────────────────────────

export const disputeMessages = pgTable("dispute_messages", {
  id:         text("id").primaryKey().$defaultFn(createId),
  disputeId:  text("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  senderId:   text("sender_id").notNull().references(() => users.id),
  message:    text("message").notNull(),
  attachments:jsonb("attachments").$type<string[]>().default([]),
  isInternal: boolean("is_internal").notNull().default(false), // admin-only messages
  createdAt:  timestamp("created_at").notNull().defaultNow(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id:          text("id").primaryKey().$defaultFn(createId),
  userId:      text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:        notificationTypeEnum("type").notNull(),
  title:       text("title").notNull(),
  message:     text("message").notNull(),
  data:        jsonb("data").$type<Record<string, string>>().default({}),
  isRead:      boolean("is_read").notNull().default(false),
  readAt:      timestamp("read_at"),
  link:        text("link"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Admin Logs ───────────────────────────────────────────────────────────────

export const adminLogs = pgTable("admin_logs", {
  id:          text("id").primaryKey().$defaultFn(createId),
  adminId:     text("admin_id").notNull().references(() => users.id),
  action:      text("action").notNull(),
  targetType:  text("target_type"),
  targetId:    text("target_id"),
  details:     jsonb("details").$type<Record<string, unknown>>().default({}),
  ipAddress:   text("ip_address"),
  userAgent:   text("user_agent"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Review          = typeof reviews.$inferSelect;
export type NewReview        = typeof reviews.$inferInsert;
export type Dispute         = typeof disputes.$inferSelect;
export type DisputeMessage  = typeof disputeMessages.$inferSelect;
export type Notification    = typeof notifications.$inferSelect;
export type AdminLog        = typeof adminLogs.$inferSelect;
