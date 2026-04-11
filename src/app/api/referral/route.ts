import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { referrals, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { createId } from "@/lib/db/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const userId = (session.user as any).id;

    // ✅ FIX — utilise users.referralCode (colonne ajoutée dans users.ts)
    const userRow = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let code = userRow[0]?.referralCode ?? null;

    if (!code) {
      const name = (session.user.name ?? "USR").replace(/\s/g, "").toUpperCase().slice(0, 3);
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      code       = `BEE${name}${rand}`;

      await db.update(users)
        .set({ referralCode: code, updatedAt: new Date() } as any)
        .where(eq(users.id, userId));
    }

    // Stats
    const stats = await db
      .select({ total: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // ✅ FIX — utilise referredId (pas refereeId)
    const recent = await db
      .select({
        referredId:  referrals.referredId,
        rewardGiven: referrals.rewardGiven,
        rewardValue: referrals.rewardValue,
        createdAt:   referrals.createdAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .limit(10);

    return NextResponse.json({
      code,
      link:              `${process.env.NEXT_PUBLIC_APP_URL}/?ref=${code}`,
      totalReferrals:    stats[0]?.total ?? 0,
      bonusPerReferral:  2000,
      recent: recent.map(r => ({
        createdAt: r.createdAt,
        status:    r.rewardGiven ? "COMPLETED" : "PENDING",
        bonus:     r.rewardValue ?? 2000,
      })),
    });
  } catch (err) {
    console.error("[referral GET]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
