import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminRevokeBadge } from "@/lib/actions/badge-engine";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { targetType } = await req.json();
  if (!["USER","PRODUCT"].includes(targetType)) {
    return NextResponse.json({ error: "targetType invalide." }, { status: 400 });
  }

  const result = await adminRevokeBadge(params.id, targetType);
  return NextResponse.json(result);
}
