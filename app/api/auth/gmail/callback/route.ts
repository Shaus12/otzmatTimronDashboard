import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { writeGmailOAuthAudit } from "@/lib/gmail/connections";
import {
  STATE_COOKIE,
  exchangeGmailCode,
  getGmailRedirectUri,
} from "@/lib/gmail/oauth";

function appOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    request.nextUrl.origin
  );
}

export async function GET(request: NextRequest) {
  const origin = appOrigin(request);
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.redirect(new URL("/systems?gmail=forbidden", origin));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/systems?gmail=denied&error=${encodeURIComponent(error)}`, origin),
    );
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/systems?gmail=invalid_state", origin));
  }

  try {
    await exchangeGmailCode({
      code,
      redirectUri: getGmailRedirectUri(origin),
      connectedBy: profile.id,
    });
    await writeGmailOAuthAudit({ actorId: profile.id, action: "create" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "token_exchange_failed";
    return NextResponse.redirect(
      new URL(
        `/systems?gmail=error&error=${encodeURIComponent(message)}`,
        origin,
      ),
    );
  }

  const response = NextResponse.redirect(
    new URL("/systems?gmail=connected", origin),
  );
  response.cookies.set(STATE_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
