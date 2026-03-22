import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
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

  const { status, isVerified, isFeatured } = await req.json();

  await db.update(vendors)
    .set({
      ...(status     !== undefined && { status:     status     as any }),
      ...(isVerified !== undefined && { isVerified: isVerified        }),
      ...(isFeatured !== undefined && { isFeatured: isFeatured        }),
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, params.id));

  return NextResponse.json({ success: true });
}
