import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.order));
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.name || !body.slug) return NextResponse.json({ error: "Nom et slug requis." }, { status: 400 });

    const [cat] = await db.insert(categories).values({
      id:         createId(),
      name:       body.name,
      slug:       body.slug,
      icon:       body.icon       ?? null,
      color:      body.color      ?? null,
      order:      Number(body.order ?? 0),
      isActive:   body.isActive   ?? true,
      isFeatured: body.isFeatured ?? false,
    }).returning();

    return NextResponse.json(cat, { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") return NextResponse.json({ error: "Ce slug est déjà pris." }, { status: 409 });
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
