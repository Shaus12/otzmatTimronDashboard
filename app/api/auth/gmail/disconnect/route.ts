import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  GMAIL_PROVIDER,
  deleteOAuthConnection,
  getOAuthConnection,
  writeGmailOAuthAudit,
} from "@/lib/gmail/connections";
import { revokeGmailToken } from "@/lib/gmail/oauth";

function appOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin
  );
}

async function disconnect(request: NextRequest) {
  const origin = appOrigin(request);
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/systems?gmail=forbidden", origin));
  }

  try {
    const existing = await getOAuthConnection(GMAIL_PROVIDER);
    if (existing) {
      const token = existing.refreshToken || existing.accessToken;
      if (token) await revokeGmailToken(token);
      await deleteOAuthConnection(GMAIL_PROVIDER);
      await writeGmailOAuthAudit({ actorId: profile.id, action: "delete" });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "disconnect_failed";
    return NextResponse.redirect(
      new URL(
        `/systems?gmail=disconnect_error&error=${encodeURIComponent(message)}`,
        origin,
      ),
    );
  }

  return NextResponse.redirect(new URL("/systems?gmail=disconnected", origin));
}

export async function GET(request: NextRequest) {
  return disconnect(request);
}

export async function POST(request: NextRequest) {
  return disconnect(request);
}
