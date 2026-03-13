import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const vendorStatusEnum = pgEnum("vendor_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
]);

export const deliveryAgentStatusEnum = pgEnum("delivery_agent_status", [
  "AVAILABLE",
  "BUSY",
  "OFFLINE",
  "SUSPENDED",
]);

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const vendors = pgTable("vendors", {
  id:              text("id").primaryKey().$defaultFn(createId),
  userId:          text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  shopName:        text("shop_name").notNull(),
  slug:            text("slug").notNull().unique(),
  description:     text("description"),
  logo:            text("logo"),
  banner:          text("banner"),
  region:          text("region").notNull(),
  city:            text("city"),
  address:         text("address"),
  phone:           text("phone"),
  whatsapp:        text("whatsapp"),
  email:           text("email"),
  website:         text("website"),
  status:          vendorStatusEnum("status").notNull().default("PENDING"),
  isVerified:      boolean("is_verified").notNull().default(false),
  isFeatured:      boolean("is_featured").notNull().default(false),
  rating:          real("rating").notNull().default(0),
  totalReviews:    integer("total_reviews").notNull().default(0),
  totalSales:      integer("total_sales").notNull().default(0),
  referralCode:    text("referral_code").unique(),
  referredBy:      text("referred_by").references(() => vendors.id),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ─── Delivery Agents ──────────────────────────────────────────────────────────

export const deliveryAgents = pgTable("delivery_agents", {
  id:                text("id").primaryKey().$defaultFn(createId),
  userId:            text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  vehicleType:       text("vehicle_type"),
  vehiclePlate:      text("vehicle_plate"),
  region:            text("region").notNull(),
  status:            deliveryAgentStatusEnum("status").notNull().default("OFFLINE"),
  plan:              text("plan").notNull().default("FREELANCE"), // FREELANCE | PREMIUM
  totalDeliveries:   integer("total_deliveries").notNull().default(0),
  successDeliveries: integer("success_deliveries").notNull().default(0),
  failedDeliveries:  integer("failed_deliveries").notNull().default(0),
  rating:            real("rating").notNull().default(0),
  totalReviews:      integer("total_reviews").notNull().default(0),
  hasBadge:          boolean("has_badge").notNull().default(false), // "Fiable" badge
  currentLat:        text("current_lat"),
  currentLng:        text("current_lng"),
  lastLocationAt:    timestamp("last_location_at"),
  createdAt:         timestamp("created_at").notNull().defaultNow(),
  updatedAt:         timestamp("updated_at").notNull().defaultNow(),
});

// ─── Vendor-Delivery Affiliations ────────────────────────────────────────────

export const vendorDeliveryAffiliations = pgTable("vendor_delivery_affiliations", {
  id:             text("id").primaryKey().$defaultFn(createId),
  vendorId:       text("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  deliveryAgentId:text("delivery_agent_id").notNull().references(() => deliveryAgents.id, { onDelete: "cascade" }),
  isPriority:     boolean("is_priority").notNull().default(true),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Vendor               = typeof vendors.$inferSelect;
export type NewVendor            = typeof vendors.$inferInsert;
export type DeliveryAgent        = typeof deliveryAgents.$inferSelect;
export type NewDeliveryAgent     = typeof deliveryAgents.$inferInsert;
