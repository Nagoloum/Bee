import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobListings, jobApplications, vendors, users } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVendorByUserId } from "@/lib/actions/vendor";

// GET — liste des offres du vendeur + candidatures
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

  const listings = await db
    .select({
      id:          jobListings.id,
      title:       jobListings.title,
      type:        jobListings.type,
      location:    jobListings.location,
      salary:      jobListings.salary,
      deadline:    jobListings.deadline,
      isActive:    jobListings.isActive,
      createdAt:   jobListings.createdAt,
    })
    .from(jobListings)
    .where(eq(jobListings.vendorId, vendor.id))
    .orderBy(desc(jobListings.createdAt));

  // Compter les candidatures par offre
  const counts: Record<string, number> = {};
  for (const listing of listings) {
    const apps = await db.select().from(jobApplications)
      .where(eq(jobApplications.jobId, listing.id));
    counts[listing.id] = apps.length;
  }

  return NextResponse.json(listings.map(l => ({ ...l, applicationsCount: counts[l.id] ?? 0 })));
}

// POST — créer une offre
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const vendor = await getVendorByUserId((session.user as any).id);
  if (!vendor) return NextResponse.json({ error: "Vendeur introuvable." }, { status: 404 });

  const { title, description, type, location, salary, deadline } = await req.json();
  if (!title || !description || !type) {
    return NextResponse.json({ error: "Titre, description et type requis." }, { status: 400 });
  }

  const [listing] = await db.insert(jobListings).values({
    id:          createId(),
    vendorId:    vendor.id,
    title,
    description,
    type:        type as any,
    location:    location || null,
    salary:      salary || null,
    deadline:    deadline ? new Date(deadline) : null,
    isActive:    true,
  }).returning();

  return NextResponse.json(listing, { status: 201 });
}
