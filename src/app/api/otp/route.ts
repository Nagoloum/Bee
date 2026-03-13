import { NextRequest, NextResponse } from "next/server";
import { sendOTP, verifyOTP, formatCMPhone } from "@/lib/sms";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { action, phone, code } = await req.json();
    const formattedPhone = formatCMPhone(phone);

    if (action === "send") {
      const result = await sendOTP(formattedPhone);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      const result = verifyOTP(formattedPhone, code);
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // Mark phone as verified in DB
      await db
        .update(users)
        .set({ phoneVerified: true, phone: formattedPhone })
        .where(eq(users.phone, formattedPhone));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
