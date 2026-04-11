import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

const DEFAULTS = {
  id:               "main",
  deliveryFeeBase:    500,
  deliveryFeeExpress: 1000,
  commissionRate:     10,
  planProPrice:       5000,
  planElitePrice:     15000,
  planDeliveryPrem:   3000,
  contactEmail:       "contact@bee.cm",
  supportPhone:       "+33 6 25 83 90 07",
  address:            "Cameroun",
  instagram:          "https://instagram.com/beecm",
  facebook:           "https://facebook.com/beecm",
  twitter:            "https://twitter.com/beecm",
  whatsapp:           "+237699000000",
};

// GET — return current settings (or defaults if not yet saved)
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const rows = await db.select().from(platformSettings).where(eq(platformSettings.id, "main")).limit(1);
    return NextResponse.json(rows[0] ?? DEFAULTS);
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return NextResponse.json(DEFAULTS);
  }
}

// PUT — upsert singleton row
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();

    const values = {
      id:               "main",
      deliveryFeeBase:    Number(body.deliveryFeeBase)  || DEFAULTS.deliveryFeeBase,
      deliveryFeeExpress: Number(body.deliveryFeeExpress) || DEFAULTS.deliveryFeeExpress,
      commissionRate:     Number(body.commissionRate)   || DEFAULTS.commissionRate,
      planProPrice:       Number(body.planProPrice)     || DEFAULTS.planProPrice,
      planElitePrice:     Number(body.planElitePrice)   || DEFAULTS.planElitePrice,
      planDeliveryPrem:   Number(body.planDeliveryPrem) || DEFAULTS.planDeliveryPrem,
      contactEmail:       String(body.contactEmail  || DEFAULTS.contactEmail),
      supportPhone:       String(body.supportPhone  || DEFAULTS.supportPhone),
      address:            String(body.address       || DEFAULTS.address),
      instagram:          String(body.instagram     || DEFAULTS.instagram),
      facebook:           String(body.facebook      || DEFAULTS.facebook),
      twitter:            String(body.twitter       || DEFAULTS.twitter),
      whatsapp:           String(body.whatsapp      || DEFAULTS.whatsapp),
      updatedAt:          new Date(),
    };

    // Upsert (insert or update on conflict)
    await db.insert(platformSettings)
      .values(values)
      .onConflictDoUpdate({ target: platformSettings.id, set: { ...values } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/settings PUT]", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
