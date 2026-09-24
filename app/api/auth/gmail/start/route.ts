import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  GMAIL_PROVIDER,
  getOAuthConnectionStatus,
} from "@/lib/gmail/connections";
import {
  STATE_COOKIE,
  buildGmailAuthUrl,
  getGmailRedirectUri,
} from "@/lib/gmail/oauth";

function appOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin
  );
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  const origin = appOrigin(request);
  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/systems?gmail=forbidden", origin));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/systems?gmail=config", origin));
  }

  const confirm = request.nextUrl.searchParams.get("confirm") === "1";
  const existing = await getOAuthConnectionStatus(GMAIL_PROVIDER);
  if (existing && !confirm) {
    const email = existing.connectedEmail || "";
    const params = new URLSearchParams({ gmail: "confirm_replace" });
    if (email) params.set("email", email);
    return NextResponse.redirect(new URL(`/systems?${params}`, origin));
  }

  const redirectUri = getGmailRedirectUri(origin);
  const state = crypto.randomUUID();
  const url = buildGmailAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
