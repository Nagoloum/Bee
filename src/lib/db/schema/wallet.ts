import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { users } from "./users";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const walletTypeEnum = pgEnum("wallet_type", [
  "VENDOR",
  "CLIENT",
  "DELIVERY",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "CREDIT",
  "DEBIT",
]);

export const transactionReasonEnum = pgEnum("transaction_reason", [
  "SALE",               // vendor receives payment
  "COMMISSION",         // platform commission deducted
  "DELIVERY_FEE",       // delivery agent credit
  "ESCROW_RELEASE",     // escrow unlocked after delivery
  "CASHBACK",           // client cashback
  "COUPON",             // coupon usage
  "REFERRAL_BONUS",     // referral reward
  "POINTS_REDEMPTION",  // points → free delivery
  "REFUND",             // refund to client/vendor
  "WITHDRAWAL",         // withdrawal request
  "SUBSCRIPTION",       // subscription payment
  "ADJUSTMENT",         // manual admin adjustment
  "WALLET_USAGE",       // paying with wallet balance
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REJECTED",
]);

// ─── Wallets ──────────────────────────────────────────────────────────────────

export const wallets = pgTable("wallets", {
  id:         text("id").primaryKey().$defaultFn(createId),
  userId:     text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  type:       walletTypeEnum("type").notNull(),
  balance:    integer("balance").notNull().default(0), // in FCFA
  escrow:     integer("escrow").notNull().default(0),  // funds held in escrow
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});

// ─── Wallet Transactions ──────────────────────────────────────────────────────

export const walletTransactions = pgTable("wallet_transactions", {
  id:          text("id").primaryKey().$defaultFn(createId),
  walletId:    text("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type:        transactionTypeEnum("type").notNull(),
  reason:      transactionReasonEnum("reason").notNull(),
  amount:      integer("amount").notNull(), // in FCFA
  balanceBefore:integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description"),
  referenceId: text("reference_id"), // orderId, withdrawalId, etc.
  createdAt:   timestamp("created_at").notNull().defaultNow(),
});

// ─── Withdrawal Requests ──────────────────────────────────────────────────────

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id:              text("id").primaryKey().$defaultFn(createId),
  userId:          text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId:        text("wallet_id").notNull().references(() => wallets.id),
  amount:          integer("amount").notNull(), // in FCFA
  status:          withdrawalStatusEnum("status").notNull().default("PENDING"),
  method:          text("method").notNull().default("mobile_money"), // mobile_money | bank
  accountDetails:  text("account_details").notNull(), // phone number or IBAN
  accountName:     text("account_name").notNull(),
  processingNote:  text("processing_note"),
  processedBy:     text("processed_by").references(() => users.id),
  processedAt:     timestamp("processed_at"),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
  updatedAt:       timestamp("updated_at").notNull().defaultNow(),
});

// ─── Cashback ────────────────────────────────────────────────────────────────

export const cashbackRules = pgTable("cashback_rules", {
  id:              text("id").primaryKey().$defaultFn(createId),
  minOrderAmount:  integer("min_order_amount").notNull().default(50000), // 50 000 FCFA
  cashbackPercent: integer("cashback_percent").notNull().default(5),     // 5%
  maxCashback:     integer("max_cashback"),
  isActive:        boolean("is_active").notNull().default(true),
  createdAt:       timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Wallet              = typeof wallets.$inferSelect;
export type WalletTransaction   = typeof walletTransactions.$inferSelect;
export type WithdrawalRequest   = typeof withdrawalRequests.$inferSelect;
