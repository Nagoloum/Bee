import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobListings, jobApplications, vendors, users } from "@/lib/db/schema";
import { createId } from "@/lib/db/utils";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/jobs — liste publique des offres actives
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");

  try {
    const query = db
      .select({
        id:          jobListings.id,
        title:       jobListings.title,
        description: jobListings.description,
        type:        jobListings.type,
        location:    jobListings.location,
        salary:      jobListings.salary,
        deadline:    jobListings.deadline,
        createdAt:   jobListings.createdAt,
        vendorId:    jobListings.vendorId,
        shopName:    vendors.shopName,
        shopLogo:    vendors.logo,
        shopSlug:    vendors.slug,
        region:      vendors.region,
      })
      .from(jobListings)
      .leftJoin(vendors, eq(jobListings.vendorId, vendors.id))
      .where(
        vendorId
          ? and(eq(jobListings.isActive, true), eq(jobListings.vendorId, vendorId))
          : eq(jobListings.isActive, true)
      )
      .orderBy(desc(jobListings.createdAt))
      .limit(50);

    const rows = await query;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/jobs — postuler à une offre
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Connectez-vous pour postuler." }, { status: 401 });

    const { jobId, message, cvUrl } = await req.json();
    if (!jobId) return NextResponse.json({ error: "jobId requis." }, { status: 400 });

    // Vérifier que l'offre existe et est active
    const job = await db.select().from(jobListings)
      .where(and(eq(jobListings.id, jobId), eq(jobListings.isActive, true)))
      .limit(1);
    if (!job[0]) return NextResponse.json({ error: "Offre introuvable ou expirée." }, { status: 404 });

    // Vérifier deadline
    if (job[0].deadline && new Date(job[0].deadline) < new Date()) {
      return NextResponse.json({ error: "La date limite de candidature est dépassée." }, { status: 400 });
    }

    // Vérifier doublon
    const existing = await db.select().from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.applicantId, session.user.id)))
      .limit(1);
    if (existing[0]) return NextResponse.json({ error: "Vous avez déjà postulé à cette offre." }, { status: 409 });

    const [app] = await db.insert(jobApplications).values({
      id:          createId(),
      jobId,
      applicantId: session.user.id,
      message:     message?.trim() || null,
      cvUrl:       cvUrl || null,
      status:      "PENDING",
    }).returning();

    return NextResponse.json(app, { status: 201 });
  } catch (err) {
    console.error("[jobs POST]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
