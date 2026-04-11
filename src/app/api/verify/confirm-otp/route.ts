import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { userVerifications, userBadges } from "@/lib/db/schema/badges";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
import { verifyOTP } from "@/lib/otp-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const userId = (session.user as any).id;
    const { channel, target, code } = await req.json();

    if (!channel || !target || !code) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    const purpose = channel === "EMAIL" ? "VERIFY_EMAIL" : "VERIFY_PHONE";
    const result  = await verifyOTP({ target, code, purpose });

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Update user_verifications table
    const existing = await db
      .select()
      .from(userVerifications)
      .where(eq(userVerifications.userId, userId))
      .limit(1);

    const updateData = channel === "EMAIL"
      ? { emailVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() }
      : { phoneVerified: true, phoneVerifiedAt: new Date(), updatedAt: new Date() };

    if (existing[0]) {
      await db.update(userVerifications)
        .set(updateData)
        .where(eq(userVerifications.userId, userId));
    } else {
      await db.insert(userVerifications).values({
        id:     createId(),
        userId,
        ...updateData,
      });
    }

    // Also update Better-Auth user fields
    if (channel === "EMAIL") {
      await db.update(users)
        .set({ emailVerified: true } as any)
        .where(eq(users.id, userId));
    } else {
      await db.update(users)
        .set({ phoneVerified: true } as any)
        .where(eq(users.id, userId));
    }

    // Check if both email & phone are now verified → award CERTIFIED badge
    const verif = existing[0] ? { ...existing[0], ...updateData } : updateData;
    const emailOk = channel === "EMAIL" ? true : (existing[0]?.emailVerified ?? false);
    const phoneOk = channel === "PHONE" ? true : (existing[0]?.phoneVerified ?? false);

    if (emailOk && phoneOk) {
      // Check if badge already exists
      const hasBadge = await db
        .select()
        .from(userBadges)
        .where(and(
          eq(userBadges.userId, userId),
          eq(userBadges.type, "CERTIFIED"),
          eq(userBadges.isActive, true),
        ))
        .limit(1);

      if (!hasBadge[0]) {
        await db.insert(userBadges).values({
          id:       createId(),
          userId,
          type:     "CERTIFIED",
          awardedAt: new Date(),
          isActive: true,
        });
      }
    }

    return NextResponse.json({
      success:    true,
      certified:  emailOk && phoneOk,
      emailVerified: emailOk,
      phoneVerified: phoneOk,
    });
  } catch (err) {
    console.error("[verify/confirm-otp]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
