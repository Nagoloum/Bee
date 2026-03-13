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
import { vendors } from "./vendors";
import { products, productVariantCombinations } from "./products";
import { deliveryAgents } from "./vendors";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",          // awaiting vendor confirmation
  "CONFIRMED",        // vendor accepted
  "PREPARING",        // being prepared
  "READY",            // ready for pickup
  "PICKED_UP",        // delivery agent picked up
  "IN_TRANSIT",       // on the way
  "DELIVERED",        // delivered to client
  "CANCELLED",        // cancelled by client or vendor
  "REFUNDED",         // refunded
  "DISPUTED",         // under dispute
]);

export const deliveryModeEnum = pgEnum("delivery_mode", [
  "SELF",             // vendor handles delivery
  "PLATFORM",         // BEE platform handles delivery
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "STRIPE",
  "MOBILE_MONEY",
  "CASH_ON_DELIVERY",
  "WALLET",
]);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id:                  text("id").primaryKey().$defaultFn(createId),
  orderNumber:         text("order_number").notNull().unique(),
  clientId:            text("client_id").notNull().references(() => users.id),
  vendorId:            text("vendor_id").notNull().references(() => vendors.id),

  // Amounts (in FCFA)
  subtotal:            integer("subtotal").notNull(),
  deliveryFee:         integer("delivery_fee").notNull().default(0),
  discount:            integer("discount").notNull().default(0),
  total:               integer("total").notNull(),

  // Status
  status:              orderStatusEnum("status").notNull().default("PENDING"),
  paymentStatus:       paymentStatusEnum("payment_status").notNull().default("PENDING"),
  paymentMethod:       paymentMethodEnum("payment_method"),

  // Delivery
  deliveryMode:        deliveryModeEnum("delivery_mode").notNull().default("PLATFORM"),
  deliveryAddress:     jsonb("delivery_address").$type<DeliveryAddressSnapshot>().notNull(),

  // Escrow
  escrowReleased:      boolean("escrow_released").notNull().default(false),
  escrowReleasedAt:    timestamp("escrow_released_at"),

  // Promo
  couponCode:          text("coupon_code"),
  couponDiscount:      integer("coupon_discount").notNull().default(0),

  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId:        text("stripe_charge_id"),

  // Notes
  clientNote:          text("client_note"),
  vendorNote:          text("vendor_note"),

  // Timeline
  confirmedAt:         timestamp("confirmed_at"),
  readyAt:             timestamp("ready_at"),
  deliveredAt:         timestamp("delivered_at"),
  cancelledAt:         timestamp("cancelled_at"),
  cancelReason:        text("cancel_reason"),

  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
});

// ─── Order Items ─────────────────────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id:                  text("id").primaryKey().$defaultFn(createId),
  orderId:             text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId:           text("product_id").notNull().references(() => products.id),
  variantCombinationId:text("variant_combination_id").references(() => productVariantCombinations.id),

  // Snapshot at purchase time
  productName:         text("product_name").notNull(),
  productImage:        text("product_image"),
  variantLabel:        text("variant_label"),

  quantity:            integer("quantity").notNull(),
  unitPrice:           integer("unit_price").notNull(),
  totalPrice:          integer("total_price").notNull(),

  reviewLeft:          boolean("review_left").notNull().default(false),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
});

// ─── Order Deliveries ────────────────────────────────────────────────────────

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "RETURNED",
]);

export const orderDeliveries = pgTable("order_deliveries", {
  id:              text("id").primaryKey().$defaultFn(createId),
  orderId:         text("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  deliveryAgentId: text("delivery_agent_id").notNull().references(() => deliveryAgents.id),

  status:          deliveryStatusEnum("status").notNull().default("ASSIGNED"),
  fee:             integer("fee").notNull().default(500), // 500 FCFA default

  proofImage:      text("proof_image"),
  failReason:      text("fail_reason"),
  deliveryNote:    text("delivery_note"),

  assignedAt:      timestamp("assigned_at").notNull().defaultNow(),
  pickedUpAt:      timestamp("picked_up_at"),
  deliveredAt:     timestamp("delivered_at"),
  failedAt:        timestamp("failed_at"),

  ratingByClient:  integer("rating_by_client"),
  reviewByClient:  text("review_by_client"),
  ratedAt:         timestamp("rated_at"),

  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ─── Order Status History ────────────────────────────────────────────────────

export const orderStatusHistory = pgTable("order_status_history", {
  id:        text("id").primaryKey().$defaultFn(createId),
  orderId:   text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status:    orderStatusEnum("status").notNull(),
  note:      text("note"),
  changedBy: text("changed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryAddressSnapshot = {
  fullName:  string;
  phone:     string;
  street:    string;
  city:      string;
  region:    string;
  country:   string;
  notes?:    string;
  lat?:      string;
  lng?:      string;
};

export type Order               = typeof orders.$inferSelect;
export type NewOrder            = typeof orders.$inferInsert;
export type OrderItem           = typeof orderItems.$inferSelect;
export type OrderDelivery       = typeof orderDeliveries.$inferSelect;
export type OrderStatusHistory  = typeof orderStatusHistory.$inferSelect;
