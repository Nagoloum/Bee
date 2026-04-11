import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobListings, jobApplications, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVendorByUserId } from "@/lib/actions/vendor";

// ── PATCH — toggle isActive ou mise à jour des champs ──────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

  // Vérifier que l'offre appartient au vendeur
  const listing = await db.select().from(jobListings)
    .where(and(eq(jobListings.id, params.id), eq(jobListings.vendorId, vendor.id)))
    .limit(1);

  if (!listing[0]) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

  const body = await req.json();
  const updateData: any = { updatedAt: new Date() };

  if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
  if (body.title)       updateData.title       = body.title;
  if (body.description) updateData.description = body.description;
  if (body.type)        updateData.type        = body.type;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.salary   !== undefined) updateData.salary   = body.salary;
  if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;

  await db.update(jobListings).set(updateData).where(eq(jobListings.id, params.id));

  return NextResponse.json({ success: true });
}

// ── DELETE — supprimer l'offre et ses candidatures ─────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

  const listing = await db.select().from(jobListings)
    .where(and(eq(jobListings.id, params.id), eq(jobListings.vendorId, vendor.id)))
    .limit(1);

  if (!listing[0]) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

  // Supprimer candidatures puis offre
  await db.delete(jobApplications).where(eq(jobApplications.jobId, params.id));
  await db.delete(jobListings).where(eq(jobListings.id, params.id));

  return NextResponse.json({ success: true });
}

// ── GET — détail offre + candidatures reçues ──────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

  const listing = await db.select().from(jobListings)
    .where(and(eq(jobListings.id, params.id), eq(jobListings.vendorId, vendor.id)))
    .limit(1);

  if (!listing[0]) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

  // Récupérer les candidatures avec infos candidat
  const apps = await db
    .select({
      id:          jobApplications.id,
      message:     jobApplications.message,
      cvUrl:       jobApplications.cvUrl,
      status:      jobApplications.status,
      createdAt:   jobApplications.createdAt,
      applicantName:  users.name,
      applicantEmail: users.email,
      applicantPhone: users.phone,
    })
    .from(jobApplications)
    .leftJoin(users, eq(jobApplications.applicantId, users.id))
    .where(eq(jobApplications.jobId, params.id))
    .orderBy(jobApplications.createdAt);

  return NextResponse.json({ listing: listing[0], applications: apps });
}
