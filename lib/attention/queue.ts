import type {
  Expense,
  ExpenseAnomalyFlag,
  ExpenseCategory,
  Fine,
  Invoice,
} from "@/lib/data/types";
import {
  expenseAnomalyLabels,
  expenseCategoryLabels,
  expenseStatusLabels,
  formatMoney,
} from "@/lib/labels";
import {
  daysOverdue,
  effectiveInvoiceStatus,
} from "@/lib/collections/status";

export type AttentionPeriod = "today" | "week" | "month";

export type AttentionQueueItem = {
  id: string;
  kind: "expense" | "fine" | "invoice";
  title: string;
  detail: string;
  amountLabel: string;
  reason: string;
  href: string;
  createdAt: string;
};

export type CurrencyTotal = {
  currency: string;
  total: number;
  count: number;
};

export type PeriodSummary = {
  period: AttentionPeriod;
  from: string;
  to: string;
  expenseCount: number;
  /** Totals grouped by currency — never mixed into one sum. */
  totalsByCurrency: CurrencyTotal[];
  byCategory: Array<{
    category: ExpenseCategory;
    label: string;
    count: number;
    totalsByCurrency: CurrencyTotal[];
  }>;
  /**
   * Flat rows for report table: one category × currency each.
   * Sorted by amount descending. Empty currencies omitted.
   */
  categoryRows: Array<{
    category: ExpenseCategory;
    label: string;
    currency: string;
    count: number;
    total: number;
  }>;
  attentionCount: number;
};

const STATUS_ATTENTION = new Set(["needs_review", "missing_document"]);

/** Schema uses `open` for newly inserted fines (spec "new"). */
function isNewFine(status: string): boolean {
  return status === "open" || status === "new";
}

function expenseNeedsAttention(e: Expense): boolean {
  return STATUS_ATTENTION.has(e.status) || Boolean(e.anomalyFlag);
}

function reasonForExpense(e: Expense): string {
  const parts: string[] = [];
  if (e.anomalyFlag) {
    parts.push(
      expenseAnomalyLabels[e.anomalyFlag as NonNullable<ExpenseAnomalyFlag>] ??
        e.anomalyFlag,
    );
  }
  if (STATUS_ATTENTION.has(e.status)) {
    parts.push(expenseStatusLabels[e.status] ?? e.status);
  }
  return parts.join(" · ") || "דורש בדיקה";
}

/**
 * Unified queue: review/missing expenses, anomaly-flagged expenses,
 * new fines, and overdue invoices. Sorted newest first by createdAt.
 */
export function buildAttentionQueue(
  expenses: Expense[],
  fines: Fine[],
  invoices: Invoice[] = [],
): AttentionQueueItem[] {
  const items: AttentionQueueItem[] = [];

  for (const e of expenses) {
    if (!expenseNeedsAttention(e)) continue;
    items.push({
      id: e.id,
      kind: "expense",
      title: e.vendor || "ללא ספק",
      detail: e.description || expenseCategoryLabels[e.category] || e.category,
      amountLabel: formatMoney(e.amount, e.currency || "ILS"),
      reason: reasonForExpense(e),
      href: `/expenses?focus=${encodeURIComponent(e.id)}`,
      createdAt: e.createdAt,
    });
  }

  for (const f of fines) {
    if (!isNewFine(f.status)) continue;
    items.push({
      id: f.id,
      kind: "fine",
      title: f.title || "קנס",
      detail: f.description || "קנס חדש",
      amountLabel: formatMoney(f.amount, "ILS"),
      reason: "קנס חדש",
      href: `/fines?focus=${encodeURIComponent(f.id)}`,
      createdAt: f.createdAt,
    });
  }

  for (const inv of invoices) {
    const days = daysOverdue(inv);
    const status = effectiveInvoiceStatus(inv, days);
    if (status !== "overdue") continue;
    items.push({
      id: inv.id,
      kind: "invoice",
      title: inv.clientName || "לקוח",
      detail: days > 0 ? `${days} ימי פיגור` : "חשבונית באיחור",
      amountLabel: formatMoney(inv.amount, "ILS"),
      reason: "חשבונית באיחור",
      href: `/collections?focus=${encodeURIComponent(inv.id)}`,
      createdAt: inv.createdAt,
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function dayKeyJerusalem(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseDay(day: string): Date {
  return new Date(`${day}T12:00:00`);
}

function addDays(day: string, delta: number): string {
  const d = parseDay(day);
  d.setDate(d.getDate() + delta);
  return dayKeyJerusalem(d);
}

export function periodRange(
  period: AttentionPeriod,
  now = new Date(),
): { from: string; to: string } {
  const to = dayKeyJerusalem(now);
  if (period === "today") return { from: to, to };

  if (period === "week") {
    // Week starts Sunday (common in IL business calendars).
    const d = parseDay(to);
    const sundayOffset = d.getDay();
    const from = addDays(to, -sundayOffset);
    return { from, to };
  }

  return { from: `${to.slice(0, 7)}-01`, to };
}

function expenseDay(e: Expense): string {
  const incurred = e.incurredOn?.slice(0, 10) ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(incurred)) return incurred;
  return e.createdAt.slice(0, 10);
}

function normalizeCurrency(value: string | null | undefined): string {
  const c = (value || "ILS").trim().toUpperCase();
  return c || "ILS";
}

/** Prefer ILS first, then alphabetical — stable display order. */
function sortCurrencyTotals(rows: CurrencyTotal[]): CurrencyTotal[] {
  return [...rows].sort((a, b) => {
    if (a.currency === "ILS" && b.currency !== "ILS") return -1;
    if (b.currency === "ILS" && a.currency !== "ILS") return 1;
    return a.currency.localeCompare(b.currency);
  });
}

function accumulateByCurrency(
  map: Map<string, CurrencyTotal>,
  currency: string,
  amount: number,
): void {
  const cur = map.get(currency) ?? { currency, total: 0, count: 0 };
  cur.total += amount;
  cur.count += 1;
  map.set(currency, cur);
}

/** Format multi-currency totals without mixing (e.g. "₪1,200.00 · $80.00"). */
export function formatCurrencyTotals(totals: CurrencyTotal[]): string {
  if (!totals.length) return formatMoney(0, "ILS");
  return sortCurrencyTotals(totals)
    .map((t) => formatMoney(t.total, t.currency))
    .join(" · ");
}

export function buildPeriodSummary(
  expenses: Expense[],
  attentionCount: number,
  period: AttentionPeriod,
  now = new Date(),
): PeriodSummary {
  const { from, to } = periodRange(period, now);
  const inPeriod = expenses.filter((e) => {
    const day = expenseDay(e);
    return day >= from && day <= to;
  });

  const overall = new Map<string, CurrencyTotal>();
  const byCategoryMap = new Map<
    ExpenseCategory,
    { count: number; currencies: Map<string, CurrencyTotal> }
  >();

  for (const e of inPeriod) {
    const currency = normalizeCurrency(e.currency);
    accumulateByCurrency(overall, currency, e.amount);

    const cat = byCategoryMap.get(e.category) ?? {
      count: 0,
      currencies: new Map<string, CurrencyTotal>(),
    };
    cat.count += 1;
    accumulateByCurrency(cat.currencies, currency, e.amount);
    byCategoryMap.set(e.category, cat);
  }

  const byCategory = [...byCategoryMap.entries()]
    .map(([category, v]) => ({
      category,
      label: expenseCategoryLabels[category] ?? category,
      count: v.count,
      totalsByCurrency: sortCurrencyTotals(
        [...v.currencies.values()].filter((t) => t.count > 0),
      ),
    }))
    .sort((a, b) => {
      const aIls = a.totalsByCurrency.find((t) => t.currency === "ILS")?.total;
      const bIls = b.totalsByCurrency.find((t) => t.currency === "ILS")?.total;
      if (aIls != null || bIls != null) return (bIls ?? 0) - (aIls ?? 0);
      return (
        (b.totalsByCurrency[0]?.total ?? 0) - (a.totalsByCurrency[0]?.total ?? 0)
      );
    });

  const categoryRows = byCategory
    .flatMap((row) =>
      row.totalsByCurrency.map((t) => ({
        category: row.category,
        label: row.label,
        currency: t.currency,
        count: t.count,
        total: t.total,
      })),
    )
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "he"));

  return {
    period,
    from,
    to,
    expenseCount: inPeriod.length,
    totalsByCurrency: sortCurrencyTotals(
      [...overall.values()].filter((t) => t.count > 0),
    ),
    byCategory,
    categoryRows,
    attentionCount,
  };
}

export function parseAttentionPeriod(
  value: string | null | undefined,
): AttentionPeriod {
  if (value === "today" || value === "week" || value === "month") return value;
  return "month";
}

export const attentionPeriodLabels: Record<AttentionPeriod, string> = {
  today: "היום",
  week: "השבוע",
  month: "החודש",
};
