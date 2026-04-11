import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Librairie OTP — installez avec: npm install otpauth qrcode
// npm install -D @types/qrcode
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

// ── GET : générer le secret + QR code ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as any).id;

  // Générer un secret TOTP
  const totp = new OTPAuth.TOTP({
    issuer:    "BEE Marketplace",
    label:     session.user.email,
    algorithm: "SHA1",
    digits:    6,
    period:    30,
    secret:    OTPAuth.Secret.fromRandom(20),
  });

  const secret = totp.secret.base32;
  const uri    = totp.toString();

  // Générer le QR code en base64
  const qrCode = await QRCode.toDataURL(uri);

  // Stocker le secret temporairement (en attente de vérification)
  await db.update(users).set({
    (twoFactorSecret): secret,
    updatedAt: new Date(),
  } as any).where(eq(users.id, userId));

  return NextResponse.json({ secret, qrCode, uri });
}

// ── POST : vérifier le code TOTP et activer le 2FA ───────────────────────────
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { code, action } = await req.json();
  const userId = (session.user as any).id;

  // Récupérer le secret stocké
  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!userRows[0]) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  const secret = (userRows[0] as any).twoFactorSecret;
  if (!secret) return NextResponse.json({ error: "Aucun secret 2FA configuré." }, { status: 400 });

  const totp = new OTPAuth.TOTP({
    issuer:    "BEE Marketplace",
    label:     session.user.email,
    algorithm: "SHA1",
    digits:    6,
    period:    30,
    secret:    OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    return NextResponse.json({ error: "Code invalide ou expiré." }, { status: 400 });
  }

  if (action === "enable") {
    await db.update(users).set({
      (twoFactorEnabled): true,
      updatedAt: new Date(),
    } as any).where(eq(users.id, userId));
    return NextResponse.json({ success: true, enabled: true });
  }

  if (action === "disable") {
    await db.update(users).set({
      (twoFactorEnabled): false,
      (twoFactorSecret):  null,
      updatedAt: new Date(),
    } as any).where(eq(users.id, userId));
    return NextResponse.json({ success: true, enabled: false });
  }

  return NextResponse.json({ success: true, valid: true });
}
