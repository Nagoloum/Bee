import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminAwardBadge } from "@/lib/actions/badge-engine";
import { db } from "@/lib/db";
import { userBadges, productBadges } from "@/lib/db/schema/badges";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const [ub, pb] = await Promise.all([
    db.select().from(userBadges).orderBy(desc(userBadges.awardedAt)).limit(100),
    db.select().from(productBadges).orderBy(desc(productBadges.awardedAt)).limit(100),
  ]);

  return NextResponse.json({
    userBadges:    ub.map(b => ({ ...b, targetId: b.userId })),
    productBadges: pb.map(b => ({ ...b, targetId: b.productId })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { targetId, targetType, type, note, expiresAt } = await req.json();

  if (!targetId || !targetType || !type) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const result = await adminAwardBadge({
    targetId, targetType, type,
    adminId:   (admin.user as any).id,
    note:      note ?? undefined,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ success: true }, { status: 201 });
}
