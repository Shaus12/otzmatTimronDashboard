import { NextResponse } from "next/server";
import { runGmailAutoSync } from "@/lib/gmail/auto-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

async function handle(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Service role not configured" },
      { status: 503 },
    );
  }

  const result = await runGmailAutoSync();
  const status = result.skippedRun && result.error ? 200 : result.error ? 207 : 200;
  return NextResponse.json(
    {
      ok: !result.error || result.skippedRun,
      inserted: result.inserted,
      skipped: result.skipped,
      skippedRun: result.skippedRun,
      error: result.error ?? null,
    },
    { status },
  );
}

/** Vercel Cron / external schedulers: GET or POST with CRON_SECRET. */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
