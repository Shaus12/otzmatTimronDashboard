import type { ExpenseCategory } from "@/lib/data/types";

export type ParsedAmount = {
  amount: number;
  currency: string;
};

export type GmailExpenseCandidate = {
  messageId: string;
  vendor: string;
  amount: number | null;
  currency: string | null;
  date: string;
  description: string;
  category: ExpenseCategory;
  rawSubject: string;
  rawFrom: string;
};

function domainFromEmail(email: string): string {
  const host = email.split("@")[1]?.toLowerCase() ?? "";
  if (!host) return email;
  const parts = host.split(".").filter(Boolean);
  if (parts.length >= 2) {
    const common = new Set(["com", "co", "il", "net", "org", "io", "mail", "email"]);
    // e.g. billing.stripe.com → stripe; mail.example.co.il → example
    let i = parts.length - 1;
    while (i > 0 && common.has(parts[i]!)) i -= 1;
    return parts[Math.max(0, i)] || host;
  }
  return host;
}

/** Prefer display name; fall back to email domain. */
export function extractVendor(fromHeader: string): string {
  const trimmed = fromHeader.trim();
  if (!trimmed) return "לא ידוע";

  const angled = trimmed.match(/^"?([^"<]*?)"?\s*<\s*([^>]+)\s*>/);
  if (angled) {
    const name = angled[1]!.trim().replace(/^["']|["']$/g, "");
    const email = angled[2]!.trim();
    if (name && !name.includes("@")) return name;
    return domainFromEmail(email);
  }

  if (trimmed.includes("@")) return domainFromEmail(trimmed);
  return trimmed.slice(0, 80);
}

function parseNumberToken(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function currencyFromSymbol(sym: string): string {
  const s = sym.trim().toLowerCase();
  if (!s) return "ILS";
  if (s.includes("₪") || s.includes("ils") || s.includes("nis") || s.includes("שח") || s.includes('ש"ח')) {
    return "ILS";
  }
  if (s.includes("$") || s.includes("usd") || s.includes("us$")) return "USD";
  if (s.includes("€") || s.includes("eur")) return "EUR";
  if (s.includes("£") || s.includes("gbp")) return "GBP";
  return "ILS";
}

/**
 * Best-effort amount + currency from subject/snippet/body text.
 * Prefers explicit "total" / "amount charged" / סה״כ cues, then plain money tokens.
 */
export function extractAmountAndCurrency(text: string): ParsedAmount | null {
  if (!text.trim()) return null;
  const haystack = text.replace(/\u00a0/g, " ");

  const labeled: Array<{ re: RegExp; currencyGroup?: number; amountGroup: number }> = [
    {
      re: /(?:amount\s+charged|total(?:\s+due)?|סה["״']?\s*כ(?:ל)?|סכום(?:\s+לתשלום)?)[:\s]*([$€£₪]|USD|EUR|GBP|ILS|NIS|US\$)?\s*([\d,]+(?:\.\d{1,2})?)/i,
      currencyGroup: 1,
      amountGroup: 2,
    },
    {
      re: /(?:amount\s+charged|total(?:\s+due)?|סה["״']?\s*כ(?:ל)?|סכום)[:\s]*([\d,]+(?:\.\d{1,2})?)\s*([$€£₪]|USD|EUR|GBP|ILS|NIS|US\$|ש["״']?ח)?/i,
      amountGroup: 1,
      currencyGroup: 2,
    },
  ];

  for (const rule of labeled) {
    const m = haystack.match(rule.re);
    if (!m) continue;
    const amount = parseNumberToken(m[rule.amountGroup] ?? "");
    if (amount == null) continue;
    const curRaw = rule.currencyGroup != null ? (m[rule.currencyGroup] ?? "") : "";
    return { amount, currency: currencyFromSymbol(curRaw || "ILS") };
  }

  const patterns: Array<{ re: RegExp; currency: string; amountGroup: number }> = [
    { re: /(?:USD|US\$)\s*([\d,]+(?:\.\d{1,2})?)/i, currency: "USD", amountGroup: 1 },
    { re: /\$\s*([\d,]+(?:\.\d{1,2})?)/, currency: "USD", amountGroup: 1 },
    { re: /(?:ILS|NIS)\s*([\d,]+(?:\.\d{1,2})?)/i, currency: "ILS", amountGroup: 1 },
    { re: /₪\s*([\d,]+(?:\.\d{1,2})?)/, currency: "ILS", amountGroup: 1 },
    { re: /([\d,]+(?:\.\d{1,2})?)\s*(?:USD|US\$|\$)/i, currency: "USD", amountGroup: 1 },
    { re: /([\d,]+(?:\.\d{1,2})?)\s*(?:ILS|NIS|₪|ש["״']?ח)/i, currency: "ILS", amountGroup: 1 },
    { re: /€\s*([\d,]+(?:\.\d{1,2})?)/, currency: "EUR", amountGroup: 1 },
    { re: /([\d,]+(?:\.\d{1,2})?)\s*€/, currency: "EUR", amountGroup: 1 },
  ];

  for (const p of patterns) {
    const m = haystack.match(p.re);
    if (!m) continue;
    const amount = parseNumberToken(m[p.amountGroup] ?? "");
    if (amount == null) continue;
    return { amount, currency: p.currency };
  }

  return null;
}

export function toIsoDate(messageDate: string, internalDateMs?: string | null): string {
  const fromHeader = Date.parse(messageDate);
  if (!Number.isNaN(fromHeader)) {
    return new Date(fromHeader).toISOString().slice(0, 10);
  }
  if (internalDateMs) {
    const ms = Number(internalDateMs);
    if (Number.isFinite(ms) && ms > 0) {
      return new Date(ms).toISOString().slice(0, 10);
    }
  }
  return new Date().toISOString().slice(0, 10);
}

export function truncateDescription(subject: string, max = 80): string {
  const s = subject.replace(/\s+/g, " ").trim() || "(ללא נושא)";
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** Simple keyword → category inference from vendor/subject text. */
export function inferExpenseCategory(
  vendor: string,
  subject: string,
  extraText = "",
): ExpenseCategory {
  const hay = `${vendor} ${subject} ${extraText}`.toLowerCase();

  const rules: Array<{ category: ExpenseCategory; patterns: RegExp[] }> = [
    {
      category: "fuel",
      patterns: [/דלק/, /תדלוק/, /\bfuel\b/, /\bgas\b/, /פז\b/, /סונול/, /דור אלון/, /yellow/],
    },
    {
      category: "insurance",
      patterns: [/ביטוח/, /\binsurance\b/, /הראל/, /מגדל/, /כלל ביטוח/, /הפניקס/],
    },
    {
      category: "software",
      patterns: [/תוכנה/, /\bsoftware\b/, /\bsaas\b/, /\bsubscription\b/, /מיקרוסופט/, /microsoft/, /google workspace/, /adobe/, /slack/, /notion/],
    },
    {
      category: "tolls",
      patterns: [/אגרה/, /אגרות/, /כביש.?6/, /\btoll\b/, /דרך ארץ/],
    },
    {
      category: "maintenance",
      patterns: [/תחזוקה/, /מוסך/, /תיקון/, /\bgarage\b/, /\brepair\b/, /שירות רכב/],
    },
    {
      category: "office",
      patterns: [/משרד/, /ציוד משרדי/, /\boffice\b/, /נייר/, /דיו/],
    },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(hay))) return rule.category;
  }
  return "other";
}

export function parseExpenseCandidate(input: {
  messageId: string;
  from: string;
  subject: string;
  dateHeader: string;
  internalDate?: string | null;
  snippet?: string;
  bodyText?: string;
}): GmailExpenseCandidate {
  const text = [input.subject, input.snippet ?? "", input.bodyText ?? ""].join("\n");
  const money = extractAmountAndCurrency(text);
  const vendor = extractVendor(input.from);
  const description = truncateDescription(input.subject);
  return {
    messageId: input.messageId,
    vendor,
    amount: money?.amount ?? null,
    currency: money?.currency ?? null,
    date: toIsoDate(input.dateHeader, input.internalDate),
    description,
    category: inferExpenseCategory(vendor, input.subject, text),
    rawSubject: input.subject || "(ללא נושא)",
    rawFrom: input.from,
  };
}
