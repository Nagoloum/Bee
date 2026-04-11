import { NextRequest, NextResponse } from "next/server";
import { runWeeklyBadgeCron } from "@/lib/actions/badge-engine";

// Called every Monday at 00:00 UTC
// Configure in vercel.json:
// { "crons": [{ "path": "/api/cron/badges", "schedule": "0 0 * * 1" }] }

export async function GET(req: NextRequest) {
  // Secure with CRON_SECRET env var
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runWeeklyBadgeCron();
    return NextResponse.json({ success: true, ran: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/badges]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
