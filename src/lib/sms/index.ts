// Africa's Talking SMS Service
// Docs: https://developers.africastalking.com/docs/sms/sending

interface SendSMSOptions {
  to:      string; // e.g. +237699000000
  message: string;
}

interface SMSResponse {
  success:  boolean;
  messageId?: string;
  error?:   string;
}

// Simple OTP store (in production use Redis or DB)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

// ─── Send SMS via Africa's Talking ────────────────────────────────────────────

export async function sendSMS({ to, message }: SendSMSOptions): Promise<SMSResponse> {
  const apiKey   = process.env.AT_API_KEY!;
  const username = process.env.AT_USERNAME ?? "sandbox";
  const senderId = process.env.AT_SENDER_ID ?? "";

  const isSandbox = username === "sandbox";
  const url = isSandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

  const body = new URLSearchParams({
    username,
    to,
    message,
    ...(senderId && { from: senderId }),
  });

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: {
        "Accept":       "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey":       apiKey,
      },
      body: body.toString(),
    });

    const data = await res.json();

    if (data?.SMSMessageData?.Recipients?.[0]?.status === "Success") {
      return {
        success:   true,
        messageId: data.SMSMessageData.Recipients[0].messageId,
      };
    }

    // Sandbox may not return Success but still works for dev
    if (isSandbox) {
      console.log("[AT Sandbox] SMS sent to:", to, "| Message:", message);
      return { success: true, messageId: "sandbox-" + Date.now() };
    }

    return {
      success: false,
      error:   data?.SMSMessageData?.Recipients?.[0]?.status ?? "Unknown error",
    };
  } catch (err) {
    console.error("[Africa's Talking] SMS error:", err);
    return { success: false, error: "Network error" };
  }
}

// ─── OTP Management ───────────────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  // Rate limiting — max 3 OTPs per 10 min per phone
  const existing = otpStore.get(phone);
  if (existing && existing.attempts >= 3 && existing.expiresAt > Date.now()) {
    return { success: false, error: "Trop de tentatives. Attendez 10 minutes." };
  }

  const code      = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

  otpStore.set(phone, { code, expiresAt, attempts: (existing?.attempts ?? 0) + 1 });

  const message = `BEE - Votre code de vérification est : ${code}\nValide 10 minutes. Ne le partagez pas.`;

  const result = await sendSMS({ to: phone, message });

  if (!result.success) {
    return { success: false, error: "Impossible d'envoyer le SMS. Réessayez." };
  }

  // In dev, always log the code
  if (process.env.NODE_ENV === "development") {
    console.log(`\n🔑 OTP for ${phone}: ${code}\n`);
  }

  return { success: true };
}

export function verifyOTP(phone: string, code: string): { valid: boolean; error?: string } {
  const entry = otpStore.get(phone);

  if (!entry) {
    return { valid: false, error: "Aucun code envoyé pour ce numéro." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: "Code expiré. Demandez un nouveau code." };
  }

  if (entry.code !== code) {
    return { valid: false, error: "Code incorrect." };
  }

  otpStore.delete(phone);
  return { valid: true };
}

// Format phone to international format for Cameroon
export function formatCMPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/[^+\d]/g, "");

  // Already in international format
  if (cleaned.startsWith("+237")) return cleaned;

  // Local format (starts with 6, 2, etc.)
  if (cleaned.startsWith("6") || cleaned.startsWith("2")) {
    return `+237${cleaned}`;
  }

  // Strip leading 0
  if (cleaned.startsWith("0")) {
    return `+237${cleaned.slice(1)}`;
  }

  return cleaned;
}
