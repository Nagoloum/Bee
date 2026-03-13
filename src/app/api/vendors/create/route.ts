import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { slugify } from "@/lib/utils/cn";

export async function POST(req: NextRequest) {
  try {
    const { userId, shopName, slug, region, description, phone } = await req.json();

    if (!userId || !shopName || !region) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const finalSlug = slug || slugify(shopName);

    await db.insert(vendors).values({
      id:          createId(),
      userId,
      shopName,
      slug:        finalSlug,
      region,
      description: description || null,
      phone:       phone || null,
      status:      "ACTIVE",
      referralCode: createId().slice(0, 8).toUpperCase(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Duplicate slug
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ce nom de boutique est déjà pris." }, { status: 409 });
    }
    console.error("[vendors/create]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
