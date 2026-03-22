import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const utapi = new UTApi();

function getFileKey(url: string): string | null {
  const match = url.match(/\/f\/([^/?]+)/);
  return match?.[1] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL manquante" }, { status: 400 });

    const key = getFileKey(url);
    if (!key) return NextResponse.json({ error: "Clé de fichier introuvable" }, { status: 400 });

    await utapi.deleteFiles([key]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[uploadthing/delete]", err);
    return NextResponse.json({ error: "Suppression échouée" }, { status: 500 });
  }
}
