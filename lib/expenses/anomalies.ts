import type { Expense, ExpenseAnomalyFlag, ExpenseCategory } from "@/lib/data/types";
import { amountsEqual, normalizeVendor } from "@/lib/expenses/duplicates";

export type AnomalyCandidate = {
  id?: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  incurredOn: string | null;
  createdAt?: string;
};

function dayKey(value: string | null | undefined): string {
  if (!value) return "";
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

/** Prefer incurred_on; fall back to created_at date. */
function expenseDay(e: { incurredOn?: string | null; createdAt?: string }): string {
  return dayKey(e.incurredOn) || dayKey(e.createdAt);
}

function daysAgoIso(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Last N expenses in the same category, newest first (by incurred/created day).
 */
function priorInCategory(
  existing: Expense[],
  category: ExpenseCategory,
  excludeId: string | undefined,
  limit: number,
): Expense[] {
  return existing
    .filter((e) => e.category === category && e.id !== excludeId)
    .sort((a, b) => {
      const da = expenseDay(a);
      const db = expenseDay(b);
      if (da !== db) return db.localeCompare(da);
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}

/**
 * הוצאה גבוהה — amount > 2× average of last 10 in category.
 * Skips when fewer than 3 prior expenses exist in that category.
 */
export function detectHighAmount(
  candidate: AnomalyCandidate,
  existing: Expense[],
): boolean {
  if (!Number.isFinite(candidate.amount) || candidate.amount <= 0) return false;
  const prior = priorInCategory(existing, candidate.category, candidate.id, 10);
  if (prior.length < 3) return false;
  const avg = prior.reduce((sum, e) => sum + e.amount, 0) / prior.length;
  if (!(avg > 0)) return false;
  return candidate.amount > avg * 2;
}

/**
 * חיוב חוזר לא מוכר — same vendor + amount 3+ times in last 30 days,
 * and the vendor has never had a row marked status=ok.
 */
export function detectUnreviewedRecurring(
  candidate: AnomalyCandidate,
  existing: Expense[],
): boolean {
  const vendor = normalizeVendor(candidate.vendor);
  if (!vendor || !Number.isFinite(candidate.amount)) return false;

  const vendorRows = existing.filter(
    (e) => e.id !== candidate.id && normalizeVendor(e.vendor) === vendor,
  );
  if (vendorRows.some((e) => e.status === "ok")) return false;

  const windowStart = daysAgoIso(30);
  const candidateDay = expenseDay(candidate);
  const inWindow = (day: string) => Boolean(day) && day >= windowStart;

  let count = inWindow(candidateDay) ? 1 : 0;
  for (const e of vendorRows) {
    if (!amountsEqual(e.amount, candidate.amount)) continue;
    if (!inWindow(expenseDay(e))) continue;
    count += 1;
  }
  return count >= 3;
}

/**
 * First matching rule wins (high_amount, then unreviewed_recurring).
 * Returns null when nothing fires. Informational only — never changes status.
 */
export function detectExpenseAnomaly(
  candidate: AnomalyCandidate,
  existing: Expense[],
): ExpenseAnomalyFlag {
  if (detectHighAmount(candidate, existing)) return "high_amount";
  if (detectUnreviewedRecurring(candidate, existing)) {
    return "unreviewed_recurring";
  }
  return null;
}

export type AttentionItem =
  | {
      kind: "expense_anomaly";
      id: string;
      label: string;
      detail: string;
      href: string;
      anomalyFlag: NonNullable<ExpenseAnomalyFlag>;
    }
  | {
      kind: "new_fine";
      id: string;
      label: string;
      detail: string;
      href: string;
    };

/** @deprecated Use buildAttentionQueue from @/lib/attention/queue. */
export function buildAttentionItems(
  expenses: Expense[],
  fines: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
  }>,
  anomalyLabels: Record<NonNullable<ExpenseAnomalyFlag>, string>,
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const e of expenses) {
    if (!e.anomalyFlag) continue;
    items.push({
      kind: "expense_anomaly",
      id: e.id,
      label: anomalyLabels[e.anomalyFlag],
      detail: `${e.vendor || "ללא ספק"} · ${e.amount}`,
      href: "/attention",
      anomalyFlag: e.anomalyFlag,
    });
  }

  for (const f of fines) {
    if (f.status !== "open" && f.status !== "new") continue;
    items.push({
      kind: "new_fine",
      id: f.id,
      label: "קנס חדש",
      detail: f.title || `קנס · ${f.amount}`,
      href: "/attention",
    });
  }

  return items;
}
