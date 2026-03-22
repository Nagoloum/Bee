import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Extract UploadThing file key from URL
function getFileKey(url: string | null | undefined): string | null {
  if (!url) return null;
  // UploadThing URLs: https://utfs.io/f/KEY or https://uploadthing.com/f/KEY
  const match = url.match(/\/f\/([^/?]+)/);
  return match?.[1] ?? null;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { shopName, slug, description, region, phone, email, logo, banner } = await req.json();

    // Fetch current values to detect replaced files
    const current = await db
      .select({ logo: vendors.logo, banner: vendors.banner })
      .from(vendors)
      .where(eq(vendors.id, params.id))
      .limit(1);

    const old = current[0];

    // Delete old UploadThing files if replaced or removed
    const toDelete: string[] = [];
    if (old?.logo && old.logo !== logo) {
      const key = getFileKey(old.logo);
      if (key) toDelete.push(key);
    }
    if (old?.banner && old.banner !== banner) {
      const key = getFileKey(old.banner);
      if (key) toDelete.push(key);
    }
    if (toDelete.length > 0) {
      await utapi.deleteFiles(toDelete).catch(err =>
        console.warn("[UT] Failed to delete old files:", err)
      );
    }

    // Save to DB — banner included ✅
    await db.update(vendors)
      .set({
        shopName,
        slug,
        description: description || null,
        region,
        phone:       phone   || null,
        email:       email   || null,
        logo:        logo    || null,
        banner:      banner  || null,   // ← was missing!
        updatedAt:   new Date(),
      })
      .where(eq(vendors.id, params.id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "23505") return NextResponse.json({ error: "Ce slug est déjà pris." }, { status: 409 });
    console.error("[vendor/settings PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
