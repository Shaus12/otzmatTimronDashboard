export type MailRecord = {
  id: string;
  vendor: string;
  subject: string;
  date: string;
  kind: "invoice" | "reminder";
  amount: number | null;
  attachmentCount: number | null;
  sourceUrl: string;
  note: string;
};

export type GmailSnapshot = {
  version: 1;
  source: "gmail";
  capturedAt: string;
  unreadInbox: number;
  search: { query: string; matchedThreads: number };
  records: MailRecord[];
};

const stringField = (value: unknown, limit = 500): string => {
  if (typeof value !== "string" || !value.trim() || value.length > limit) throw new Error("Invalid text");
  return value;
};

const countField = (value: unknown): number => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error("Invalid count");
  return value as number;
};

export function parseGmailSnapshot(input: unknown): GmailSnapshot {
  if (!input || typeof input !== "object") throw new Error("Invalid snapshot");
  const value = input as Record<string, unknown>;
  if (value.version !== 1 || value.source !== "gmail" || !Array.isArray(value.records)
    || value.records.length > 500 || !value.search || typeof value.search !== "object") throw new Error("Invalid format");
  const capturedAt = stringField(value.capturedAt);
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(capturedAt) || Number.isNaN(Date.parse(capturedAt))) throw new Error("Invalid timestamp");
  const ids = new Set<string>();
  const records = value.records.map((record: unknown): MailRecord => {
    if (!record || typeof record !== "object") throw new Error("Invalid record");
    const row = record as Record<string, unknown>;
    const id = stringField(row.id, 100);
    if (ids.has(id)) throw new Error("Duplicate record");
    ids.add(id);
    const date = stringField(row.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))
      || new Date(date).toISOString().slice(0,10) !== date) throw new Error("Invalid date");
    if (row.kind !== "invoice" && row.kind !== "reminder") throw new Error("Invalid kind");
    if (row.amount !== null && (typeof row.amount !== "number" || !Number.isFinite(row.amount) || row.amount < 0)) throw new Error("Invalid amount");
    const sourceUrl = new URL(stringField(row.sourceUrl, 3000));
    if (sourceUrl.origin !== "https://mail.google.com" || sourceUrl.username || sourceUrl.password
      || !sourceUrl.pathname.startsWith("/mail/") || !sourceUrl.hash) throw new Error("Invalid mail link");
    return { id, date, kind: row.kind, amount: row.amount as number | null,
      vendor: stringField(row.vendor, 100), subject: stringField(row.subject), note: stringField(row.note),
      sourceUrl: sourceUrl.href, attachmentCount: row.attachmentCount === null ? null : countField(row.attachmentCount) };
  });
  const search = value.search as Record<string, unknown>;
  return { version: 1, source: "gmail", capturedAt, unreadInbox: countField(value.unreadInbox),
    search: { query: stringField(search.query), matchedThreads: countField(search.matchedThreads) }, records };
}
