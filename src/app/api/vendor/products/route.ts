import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const {
      vendorId, name, slug, description, shortDesc,
      categoryId, basePrice, comparePrice, stock, sku,
      images, status,
    } = body;

    if (!name || !basePrice || stock === undefined) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
    }

    const id = createId();
    await db.insert(products).values({
      id,
      vendorId,
      name,
      slug:        slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || null,
      shortDesc:   shortDesc   || null,
      categoryId:  categoryId  || null,
      basePrice:   Number(basePrice),
      comparePrice:comparePrice ? Number(comparePrice) : null,
      stock:       Number(stock),
      sku:         sku || null,
      images:      images ?? [],
      status:      status ?? "DRAFT",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ce slug existe déjà. Changez le nom ou l'URL." }, { status: 409 });
    }
    console.error("[vendor/products POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
