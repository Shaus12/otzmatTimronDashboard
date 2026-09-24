import type { Expense, ExpenseCategory } from "@/lib/data/types";
import {
  findBatchNearDuplicatePeers,
  findDuplicateExpenses,
} from "@/lib/expenses/duplicates";
import {
  EXPENSE_CATEGORIES,
  type ColumnMapping,
  type ImportDuplicateKind,
  type ImportTargetField,
  type ImportTargetTable,
  type MappedImportRow,
  type ParsedSheet,
} from "./types";

function parseAmount(raw: string): number | null {
  if (!raw.trim()) return null;
  const cleaned = raw
    .replace(/[₪$€£,\s]/g, "")
    .replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.abs(n) * 100) / 100;
}

/** Accept YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY, MM/DD/YYYY (ambiguous → prefer DMY). */
export function parseFlexibleDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const t = Date.parse(`${s}T12:00:00Z`);
    return Number.isNaN(t) ? null : s;
  }
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const year = Number(dmy[3]);
    // Prefer DMY when day > 12; otherwise still treat as DMY (IL locale).
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const t = Date.parse(`${iso}T12:00:00Z`);
      return Number.isNaN(t) ? null : iso;
    }
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return null;
}

function parseCategory(raw: string): ExpenseCategory | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  const he: Record<string, ExpenseCategory> = {
    דלק: "fuel",
    תדלוק: "fuel",
    fuel: "fuel",
    "כביש 6": "tolls",
    אגרות: "tolls",
    אגרה: "tolls",
    תחזוקה: "maintenance",
    משרד: "office",
    ביטוח: "insurance",
    insurance: "insurance",
    תוכנה: "software",
    software: "software",
    אחר: "other",
  };
  if (he[v]) return he[v];
  if ((EXPENSE_CATEGORIES as string[]).includes(v)) return v as ExpenseCategory;
  return null;
}

function reverseMapping(
  mapping: ColumnMapping,
): Partial<Record<ImportTargetField, string>> {
  const out: Partial<Record<ImportTargetField, string>> = {};
  for (const [sourceCol, target] of Object.entries(mapping)) {
    if (target) out[target] = sourceCol;
  }
  return out;
}

function getMapped(
  row: Record<string, string>,
  sourceCol: string | undefined,
): string {
  if (!sourceCol) return "";
  return row[sourceCol] ?? "";
}

function duplicateNoteFor(
  kind: ImportDuplicateKind | null,
  batchPeers: number[] | undefined,
): string | null {
  if (kind === "existing") return "כפילות מול קיים";
  if (kind === "batch") {
    const peers = batchPeers?.length
      ? ` (שורות ${batchPeers.join(", ")})`
      : "";
    return `כפילות אפשרית בקובץ${peers}`;
  }
  return null;
}

/**
 * Apply column mapping to parsed sheet rows.
 * Expenses: flags DB duplicates (vendor+amount+date) and within-batch
 * near-duplicates (vendor+amount, dates may differ). Existing wins if both.
 */
export function applyColumnMapping(
  sheet: ParsedSheet,
  targetTable: ImportTargetTable,
  mapping: ColumnMapping,
  existingExpenses: Expense[] = [],
): MappedImportRow[] {
  const byTarget = reverseMapping(mapping);

  const baseRows: MappedImportRow[] = sheet.rows.map((row, rowIndex) => {
    const amount = parseAmount(getMapped(row, byTarget.amount));
    const dateField =
      targetTable === "expenses" ? byTarget.incurred_on : byTarget.due_date;
    const date = parseFlexibleDate(getMapped(row, dateField));
    const description = getMapped(row, byTarget.description).slice(0, 500);
    const vendor = getMapped(row, byTarget.vendor).slice(0, 120);
    const title = getMapped(row, byTarget.title).slice(0, 200);
    const clientName = getMapped(row, byTarget.client_name).slice(0, 200);
    const category = parseCategory(getMapped(row, byTarget.category));

    const errors: string[] = [];
    if (amount == null) errors.push("סכום חסר או לא תקין");
    if (!date) errors.push("תאריך חסר או לא תקין");
    if (targetTable === "expenses" && !vendor.trim()) {
      errors.push("ספק חסר");
    }
    if (targetTable === "invoices" && !clientName.trim()) {
      errors.push("שם לקוח חסר");
    }

    let duplicateKind: ImportDuplicateKind | null = null;
    if (
      targetTable === "expenses" &&
      amount != null &&
      date &&
      vendor.trim()
    ) {
      const existing = findDuplicateExpenses(existingExpenses, {
        vendor,
        amount,
        incurredOn: date,
      });
      if (existing.length > 0) duplicateKind = "existing";
    }

    return {
      rowIndex,
      amount,
      date,
      description,
      category,
      vendor,
      title,
      clientName,
      isDuplicate: duplicateKind != null,
      duplicateKind,
      duplicateNote: duplicateNoteFor(duplicateKind, undefined),
      errors,
    };
  });

  if (targetTable !== "expenses") return baseRows;

  const batchPeers = findBatchNearDuplicatePeers(baseRows);
  return baseRows.map((row) => {
    if (row.duplicateKind === "existing") return row;
    const peers = batchPeers.get(row.rowIndex);
    if (!peers?.length) return row;
    const kind: ImportDuplicateKind = "batch";
    return {
      ...row,
      isDuplicate: true,
      duplicateKind: kind,
      duplicateNote: duplicateNoteFor(kind, peers),
    };
  });
}

/** Heuristic auto-map by matching common Hebrew/English header names. */
export function suggestMapping(
  headers: string[],
  targetTable: ImportTargetTable,
): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const h of headers) mapping[h] = "";

  const assign = (field: ImportTargetField, patterns: RegExp[]) => {
    const hit = headers.find((h) => patterns.some((p) => p.test(h)));
    if (!hit) return;
    if (Object.values(mapping).includes(field)) return;
    mapping[hit] = field;
  };

  assign("amount", [/סכום/, /amount/i, /sum/i, /total/i, /חיוב/, /זכות/]);
  if (targetTable === "expenses") {
    assign("incurred_on", [/תאריך/, /date/i, /יום/, /value.?date/i]);
    assign("vendor", [/ספק/, /vendor/i, /שם/, /תיאור.?עסקה/, /merchant/i]);
    assign("description", [/תיאור/, /desc/i, /פרטים/, /memo/i, /הערה/]);
    assign("category", [/קטגור/, /category/i, /סוג/]);
  } else if (targetTable === "fines") {
    assign("due_date", [/תאריך/, /date/i, /יעד/, /due/i]);
    assign("description", [/תיאור/, /desc/i, /פרטים/, /עבירה/]);
    assign("title", [/כותרת/, /title/i, /נושא/]);
  } else {
    assign("due_date", [/תאריך/, /date/i, /יעד/, /due/i]);
    assign("client_name", [/לקוח/, /client/i, /customer/i, /שם/]);
  }

  return mapping;
}
