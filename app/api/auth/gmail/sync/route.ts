import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  GMAIL_PROVIDER,
  getOAuthConnectionStatus,
  setGmailSyncEnabled,
} from "@/lib/gmail/connections";

export const dynamic = "force-dynamic";

/**
 * Admin-only toggle for automatic Gmail expense sync (gmail_sync_enabled).
 * Body: { enabled: boolean }
 */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  let enabled: boolean;
  try {
    const body = (await request.json()) as { enabled?: unknown };
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled חייב להיות boolean" },
        { status: 400 },
      );
    }
    enabled = body.enabled;
  } catch {
    return NextResponse.json({ error: "גוף בקשה לא תקין" }, { status: 400 });
  }

  const status = await getOAuthConnectionStatus(GMAIL_PROVIDER);
  if (!status) {
    return NextResponse.json({ error: "Gmail לא מחובר" }, { status: 400 });
  }

  try {
    const updated = await setGmailSyncEnabled(enabled);
    revalidatePath("/systems");
    revalidatePath("/systems/gmail");
    revalidatePath("/");
    return NextResponse.json({
      enabled: updated?.gmailSyncEnabled ?? enabled,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "עדכון נכשל";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }
  const status = await getOAuthConnectionStatus(GMAIL_PROVIDER);
  return NextResponse.json({
    enabled: status?.gmailSyncEnabled ?? false,
    connected: Boolean(status),
    lastSyncedAt: status?.lastSyncedAt ?? null,
  });
}
