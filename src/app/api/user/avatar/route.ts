import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

function getFileKey(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/f\/([^/?]+)/);
  return match?.[1] ?? null;
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { imageUrl } = await req.json();

    // Fetch current image to delete old one from UploadThing
    const current = await db
      .select({ image: users.image })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const oldKey = getFileKey(current[0]?.image);
    if (oldKey) {
      await utapi.deleteFiles([oldKey]).catch(err =>
        console.warn("[UT] Could not delete old avatar:", err)
      );
    }

    await db.update(users)
      .set({ image: imageUrl || null, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user/avatar PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
