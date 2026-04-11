import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promoBanners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// PATCH — update a banner
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();

    await db.update(promoBanners)
      .set({
        ...(body.title       !== undefined && { title:       body.title }),
        ...(body.subtitle    !== undefined && { subtitle:    body.subtitle }),
        ...(body.cta         !== undefined && { cta:         body.cta }),
        ...(body.ctaHref     !== undefined && { ctaHref:     body.ctaHref }),
        ...(body.bgColor     !== undefined && { bgColor:     body.bgColor }),
        ...(body.accentColor !== undefined && { accentColor: body.accentColor }),
        ...(body.image       !== undefined && { image:       body.image || null }),
        ...(body.badge       !== undefined && { badge:       body.badge || null }),
        ...(body.sortOrder   !== undefined && { sortOrder:   body.sortOrder }),
        ...(body.isActive    !== undefined && { isActive:    body.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(promoBanners.id, params.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/banners PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE — remove a banner
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    await db.delete(promoBanners).where(eq(promoBanners.id, params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/banners DELETE]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
