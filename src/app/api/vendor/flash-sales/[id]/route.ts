import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { flashSales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await db.delete(flashSales).where(eq(flashSales.id, params.id));
  return NextResponse.json({ success: true });
}
