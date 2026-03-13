import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user:         schema.users,
      session:      schema.sessions,
      account:      schema.accounts,
      verification: schema.verifications,
    },
  }),

  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:  process.env.BETTER_AUTH_SECRET!,

  // ─── Email + Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled:          true,
    requireEmailVerification: false, // simplified for now
    minPasswordLength: 8,
  },

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI:  `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },

  // ─── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn:          60 * 60 * 24 * 30,  // 30 days
    updateAge:          60 * 60 * 24,        // refresh every 24h
    cookieCache: {
      enabled:   true,
      maxAge:    60 * 5,
    },
  },

  // ─── User extra fields ─────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type:         "string",
        defaultValue: "CLIENT",
        input:        true,
      },
      phone: {
        type:    "string",
        input:   true,
        required: false,
      },
      phoneVerified: {
        type:         "boolean",
        defaultValue: false,
        input:        false,
      },
      status: {
        type:         "string",
        defaultValue: "ACTIVE",
        input:        false,
      },
      region: {
        type:    "string",
        input:   true,
        required: false,
      },
    },
  },

  // ─── Trusted origins ───────────────────────────────────────────────────────
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User    = typeof auth.$Infer.Session.user;
