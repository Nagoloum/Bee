import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  await db.update(categories).set({
    ...(body.name       !== undefined && { name:       body.name }),
    ...(body.slug       !== undefined && { slug:       body.slug }),
    ...(body.icon       !== undefined && { icon:       body.icon }),
    ...(body.color      !== undefined && { color:      body.color }),
    ...(body.order      !== undefined && { order:      Number(body.order) }),
    ...(body.isActive   !== undefined && { isActive:   body.isActive }),
    ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
    updatedAt: new Date(),
  }).where(eq(categories.id, params.id));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await db.delete(categories).where(eq(categories.id, params.id));
  return NextResponse.json({ success: true });
}
