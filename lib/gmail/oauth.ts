import "server-only";
import { google } from "googleapis";
import {
  GMAIL_PROVIDER,
  getOAuthConnection,
  updateOAuthTokens,
  upsertOAuthConnection,
} from "./connections";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const STATE_COOKIE = "gmail_oauth_state";

export { STATE_COOKIE };

function requireGoogleEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }
  return { clientId, clientSecret };
}

export function getGmailRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/auth/gmail/callback`;
}

export function createOAuth2Client(redirectUri: string) {
  const { clientId, clientSecret } = requireGoogleEnv();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildGmailAuthUrl(redirectUri: string, state: string): string {
  const client = createOAuth2Client(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_SCOPE],
    state,
  });
}

export async function exchangeGmailCode(opts: {
  code: string;
  redirectUri: string;
  connectedBy: string;
}): Promise<{ connectedEmail: string | null }> {
  const client = createOAuth2Client(opts.redirectUri);
  const { tokens } = await client.getToken(opts.code);
  if (!tokens.access_token) {
    throw new Error("Google did not return an access token");
  }
  // On re-consent Google may omit refresh_token; keep existing if so.
  const existing = await getOAuthConnection(GMAIL_PROVIDER);
  const refreshToken = tokens.refresh_token || existing?.refreshToken;
  if (!refreshToken) {
    throw new Error("Google did not return a refresh token");
  }

  const expiresAt = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : null;

  client.setCredentials(tokens);
  const gmail = google.gmail({ version: "v1", auth: client });
  let connectedEmail: string | null = existing?.connectedEmail ?? null;
  try {
    const profile = await gmail.users.getProfile({ userId: "me" });
    connectedEmail = profile.data.emailAddress ?? connectedEmail;
  } catch {
    // Profile lookup is best-effort; connection still proceeds.
  }

  await upsertOAuthConnection({
    provider: GMAIL_PROVIDER,
    accessToken: tokens.access_token,
    refreshToken,
    expiresAt,
    connectedBy: opts.connectedBy,
    connectedEmail,
  });

  return { connectedEmail };
}

/** Best-effort revoke of the refresh/access token at Google. */
export async function revokeGmailToken(token: string): Promise<void> {
  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // Ignore revoke network failures — local disconnect still proceeds.
  }
}

/** Returns a usable access token, refreshing and persisting when expired. */
export async function getValidGmailAccessToken(): Promise<string> {
  const connection = await getOAuthConnection(GMAIL_PROVIDER);
  if (!connection) {
    throw new Error("Gmail is not connected");
  }

  const expiresAtMs = connection.expiresAt
    ? new Date(connection.expiresAt).getTime()
    : 0;
  const stillValid =
    expiresAtMs > Date.now() + 60_000 && Boolean(connection.accessToken);

  if (stillValid) return connection.accessToken;

  const redirectUri = getGmailRedirectUri(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  );
  const client = createOAuth2Client(redirectUri);
  client.setCredentials({ refresh_token: connection.refreshToken });
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("Failed to refresh Gmail access token");
  }

  const expiresAt = credentials.expiry_date
    ? new Date(credentials.expiry_date).toISOString()
    : null;

  await updateOAuthTokens(GMAIL_PROVIDER, {
    accessToken: credentials.access_token,
    refreshToken: credentials.refresh_token || undefined,
    expiresAt,
  });

  return credentials.access_token;
}

export type GmailMessageRow = {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
};

export type GmailMessageWithBody = GmailMessageRow & {
  bodyText: string;
  internalDate: string | null;
};

const INVOICE_SUBJECTS =
  "(subject:חשבונית OR subject:invoice OR subject:receipt OR subject:קבלה OR subject:אסמכתא OR subject:תשלום)";

function buildInvoiceQuery(after: Date | null | undefined): string {
  if (after && !Number.isNaN(after.getTime())) {
    const y = after.getUTCFullYear();
    const m = after.getUTCMonth() + 1;
    const d = after.getUTCDate();
    return `after:${y}/${m}/${d} ${INVOICE_SUBJECTS}`;
  }
  return `newer_than:90d ${INVOICE_SUBJECTS}`;
}

function headerValue(
  headers: { name?: string | null; value?: string | null }[],
  name: string,
): string {
  return (
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    ""
  );
}

function decodeBase64Url(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const buf = Buffer.from(padded, "base64");
  return buf.toString("utf8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

type GmailPart = {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: GmailPart[] | null;
};

function collectBodies(part: GmailPart | undefined | null, out: { plain: string[]; html: string[] }) {
  if (!part) return;
  const mime = (part.mimeType || "").toLowerCase();
  const data = part.body?.data;
  if (data) {
    const text = decodeBase64Url(data);
    if (mime === "text/plain") out.plain.push(text);
    else if (mime === "text/html") out.html.push(text);
  }
  for (const child of part.parts ?? []) collectBodies(child, out);
}

function extractBodyText(payload: GmailPart | undefined | null): string {
  const out = { plain: [] as string[], html: [] as string[] };
  collectBodies(payload, out);
  if (out.plain.length) return out.plain.join("\n").slice(0, 50_000);
  if (out.html.length) return stripHtml(out.html.join("\n")).slice(0, 50_000);
  return "";
}

async function listInvoiceMessageIds(
  gmail: ReturnType<typeof google.gmail>,
  maxResults: number,
  after?: Date | null,
): Promise<string[]> {
  const list = await gmail.users.messages.list({
    userId: "me",
    q: buildInvoiceQuery(after),
    maxResults,
  });
  return (list.data.messages ?? [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));
}

export async function fetchRecentInvoiceLikeMessages(
  maxResults = 15,
): Promise<GmailMessageRow[]> {
  const accessToken = await getValidGmailAccessToken();
  const redirectUri = getGmailRedirectUri(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  );
  const auth = createOAuth2Client(redirectUri);
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const ids = await listInvoiceMessageIds(gmail, maxResults);
  const rows: GmailMessageRow[] = [];
  for (const id of ids) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });
    const headers = msg.data.payload?.headers ?? [];
    rows.push({
      id,
      subject: headerValue(headers, "Subject") || "(ללא נושא)",
      from: headerValue(headers, "From"),
      date: headerValue(headers, "Date") || msg.data.internalDate || "",
      snippet: msg.data.snippet ?? "",
    });
  }
  return rows;
}

export type FetchGmailMessagesOptions = {
  /** When set, Gmail query uses after:YYYY/M/D instead of newer_than:90d. */
  after?: Date | null;
};

/** Full message payload for expense parsing (subject + body). Separate from fetchData(). */
export async function fetchRecentInvoiceLikeMessagesWithBody(
  maxResults = 25,
  options: FetchGmailMessagesOptions = {},
): Promise<GmailMessageWithBody[]> {
  const accessToken = await getValidGmailAccessToken();
  const redirectUri = getGmailRedirectUri(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  );
  const auth = createOAuth2Client(redirectUri);
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const ids = await listInvoiceMessageIds(gmail, maxResults, options.after);
  const rows: GmailMessageWithBody[] = [];
  for (const id of ids) {
    const msg = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });
    const headers = msg.data.payload?.headers ?? [];
    rows.push({
      id,
      subject: headerValue(headers, "Subject") || "(ללא נושא)",
      from: headerValue(headers, "From"),
      date: headerValue(headers, "Date") || msg.data.internalDate || "",
      snippet: msg.data.snippet ?? "",
      bodyText: extractBodyText(msg.data.payload as GmailPart),
      internalDate: msg.data.internalDate ?? null,
    });
  }
  return rows;
}
