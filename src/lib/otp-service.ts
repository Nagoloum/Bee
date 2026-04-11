"use server";

import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema/badges";
import { createId } from "@/lib/db/utils";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? "BEE Marketplace <noreply@bee.cm>";

// ── Generate 6-digit code ─────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Africa's Talking SMS ───────────────────────────────────────────────────

async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const AT_KEY      = process.env.AFRICASTALKING_API_KEY!;
    const AT_USERNAME = process.env.AFRICASTALKING_USERNAME ?? "sandbox";

    const params = new URLSearchParams({
      username: AT_USERNAME,
      to:       phone,
      message,
      from:     process.env.AFRICASTALKING_SENDER_ID ?? "BEE",
    });

    const baseURL = AT_USERNAME === "sandbox"
      ? "https://api.sandbox.africastalking.com/version1/messaging"
      : "https://api.africastalking.com/version1/messaging";

    const res = await fetch(baseURL, {
      method:  "POST",
      headers: {
        "Accept":       "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey":       AT_KEY,
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("[AT SMS]", data);
    return res.ok;
  } catch (err) {
    console.error("[AT SMS] Error:", err);
    return false;
  }
}

// ── Send OTP email ────────────────────────────────────────────────────────

async function sendOTPEmail(email: string, code: string, purpose: string): Promise<boolean> {
  const subject = purpose === "VERIFY_EMAIL"
    ? "Vérification de votre email BEE"
    : "Votre code de connexion BEE";

  const html = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
        <tr><td style="background:linear-gradient(135deg,#F6861A,#E5750D);border-radius:16px 16px 0 0;padding:28px;text-align:center;">
          <h1 style="margin:0;font-family:Poppins,sans-serif;font-size:26px;font-weight:900;color:#fff;">🐝 BEE</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:36px;text-align:center;">
          <h2 style="margin:0 0 12px;font-family:Poppins,sans-serif;font-size:20px;font-weight:800;color:#2d2417;">
            Votre code de vérification
          </h2>
          <p style="margin:0 0 28px;color:#6b5b47;font-size:14px;line-height:1.6;">
            Utilisez ce code pour vérifier votre adresse email.<br/>Il expire dans <strong>10 minutes</strong>.
          </p>
          <div style="background:#faf7f2;border:2px dashed #F6861A;border-radius:16px;padding:24px;margin-bottom:28px;">
            <p style="margin:0;font-family:monospace;font-size:40px;font-weight:900;letter-spacing:12px;color:#F6861A;">
              ${code}
            </p>
          </div>
          <p style="margin:0;color:#a08060;font-size:12px;">
            Si vous n'avez pas demandé ce code, ignorez cet email.
          </p>
        </td></tr>
        <tr><td style="background:#faf7f2;border-radius:0 0 16px 16px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#a08060;">BEE Marketplace · Cameroun</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    await resend.emails.send({ from: FROM, to: email, subject, html });
    return true;
  } catch (err) {
    console.error("[OTP Email]", err);
    return false;
  }
}

// ── Main: Send OTP ─────────────────────────────────────────────────────────

export type OTPChannel = "EMAIL" | "PHONE";
export type OTPPurpose = "VERIFY_EMAIL" | "VERIFY_PHONE" | "LOGIN" | "RESET_PASSWORD";

export async function sendOTP(params: {
  userId?:  string;
  target:   string;   // email or phone number
  channel:  OTPChannel;
  purpose:  OTPPurpose;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, target, channel, purpose } = params;

  // Rate limit: max 3 OTPs per 10 min per target
  const recent = await db
    .select()
    .from(otpCodes)
    .where(and(
      eq(otpCodes.target, target),
      gt(otpCodes.createdAt, new Date(Date.now() - 10 * 60 * 1000)),
    ));

  if (recent.length >= 3) {
    return { success: false, error: "Trop de tentatives. Réessayez dans 10 minutes." };
  }

  const code      = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.insert(otpCodes).values({
    id:        createId(),
    userId:    userId ?? null,
    target,
    code,      // In production: hash this with bcrypt
    purpose:   purpose as any,
    expiresAt,
  });

  let sent = false;
  if (channel === "EMAIL") {
    sent = await sendOTPEmail(target, code, purpose);
  } else {
    const msg = `BEE: Votre code de vérification est ${code}. Valable 10 minutes. Ne le partagez pas.`;
    sent = await sendSMS(target, msg);
  }

  if (!sent) return { success: false, error: "Échec d'envoi. Vérifiez votre email/téléphone." };
  return { success: true };
}

// ── Verify OTP ─────────────────────────────────────────────────────────────

export async function verifyOTP(params: {
  target:  string;
  code:    string;
  purpose: OTPPurpose;
}): Promise<{ valid: boolean; error?: string }> {
  const { target, code, purpose } = params;

  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(
      eq(otpCodes.target,  target),
      eq(otpCodes.purpose, purpose as any),
      gt(otpCodes.expiresAt, new Date()),
    ));

  if (!rows[0]) return { valid: false, error: "Code invalide ou expiré." };

  const otp = rows[0];
  if (otp.usedAt)            return { valid: false, error: "Ce code a déjà été utilisé." };
  if ((otp.attempts ?? 0) >= 5) return { valid: false, error: "Trop de tentatives. Demandez un nouveau code." };

  if (otp.code !== code) {
    await db.update(otpCodes)
      .set({ attempts: (otp.attempts ?? 0) + 1 })
      .where(eq(otpCodes.id, otp.id));
    return { valid: false, error: "Code incorrect." };
  }

  // Mark as used
  await db.update(otpCodes)
    .set({ usedAt: new Date() })
    .where(eq(otpCodes.id, otp.id));

  return { valid: true };
}
