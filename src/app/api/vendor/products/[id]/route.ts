import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVendorByUserId } from "@/lib/actions/vendor";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const vendor = await getVendorByUserId(session.user.id);
    if (!vendor)  return NextResponse.json({ error: "Vendeur introuvable" }, { status: 403 });

    // Ensure product belongs to vendor
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, params.id), eq(products.vendorId, vendor.id)))
      .limit(1);

    if (!existing[0]) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

    const body = await req.json();
    const {
      name, slug, description, shortDesc,
      categoryId, basePrice, comparePrice, stock, sku,
      images, status, hasVariants,
    } = body;

    if (!name || basePrice === undefined || stock === undefined) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
    }

    await db.update(products)
      .set({
        name,
        slug:         slug || name.toLowerCase().replace(/\s+/g, "-"),
        description:  description || null,
        shortDesc:    shortDesc   || null,
        categoryId:   categoryId  || null,
        basePrice:    Number(basePrice),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock:        Number(stock),
        sku:          sku || null,
        images:       images ?? [],
        status:       status ?? "DRAFT",
        hasVariants:  !!hasVariants,
        updatedAt:    new Date(),
      })
      .where(eq(products.id, params.id));

    return NextResponse.json({ success: true, id: params.id });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ce slug est déjà pris." }, { status: 409 });
    }
    console.error("[vendor/products PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
