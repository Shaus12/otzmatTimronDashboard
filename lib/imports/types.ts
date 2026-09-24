import type { ExpenseCategory } from "@/lib/data/types";
import type { WritableEntity } from "@/lib/auth/permissions";

export type ImportTargetTable = "expenses" | "fines" | "invoices";

/** Logical / physical target fields shown in the mapper (per table). */
export type ImportTargetField =
  | "incurred_on"
  | "due_date"
  | "amount"
  | "description"
  | "category"
  | "vendor"
  | "title"
  | "client_name";

/** source column header → target field (or "" / omit to skip). */
export type ColumnMapping = Record<string, ImportTargetField | "">;

export type ParsedSheet = {
  fileName: string;
  headers: string[];
  /** Raw cell values as strings, keyed by header. */
  rows: Record<string, string>[];
};

export type ImportDuplicateKind = "existing" | "batch";

export type MappedImportRow = {
  rowIndex: number;
  amount: number | null;
  date: string | null;
  description: string;
  category: ExpenseCategory | null;
  vendor: string;
  title: string;
  clientName: string;
  isDuplicate: boolean;
  /** Which duplicate signal fired (existing DB row vs another row in this file). */
  duplicateKind: ImportDuplicateKind | null;
  /** Hebrew note for the הערות column. */
  duplicateNote: string | null;
  errors: string[];
};

export type ImportMappingTemplate = {
  id: string;
  sourceName: string;
  targetTable: ImportTargetTable;
  columnMapping: ColumnMapping;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportBatch = {
  id: string;
  sourceName: string;
  targetTable: ImportTargetTable;
  fileName: string;
  rowCount: number;
  importedBy: string | null;
  importerName: string | null;
  createdAt: string;
};

export const TARGET_TABLE_LABELS: Record<ImportTargetTable, string> = {
  expenses: "הוצאות",
  fines: "קנסות",
  invoices: "חשבוניות",
};

export const TARGET_FIELDS: Record<
  ImportTargetTable,
  { field: ImportTargetField; label: string; required?: boolean }[]
> = {
  expenses: [
    { field: "incurred_on", label: "תאריך (incurred_on)", required: true },
    { field: "amount", label: "סכום", required: true },
    { field: "description", label: "תיאור" },
    { field: "category", label: "קטגוריה" },
    { field: "vendor", label: "ספק", required: true },
  ],
  fines: [
    { field: "due_date", label: "תאריך יעד (due_date)", required: true },
    { field: "amount", label: "סכום", required: true },
    { field: "description", label: "תיאור" },
    { field: "title", label: "כותרת" },
  ],
  invoices: [
    { field: "due_date", label: "תאריך יעד (due_date)", required: true },
    { field: "amount", label: "סכום", required: true },
    { field: "client_name", label: "שם לקוח", required: true },
  ],
};

export const SUGGESTED_SOURCES = [
  "בנק לאומי",
  "מס״ב",
  "ייצוא קנסות",
  "ייצוא חשבוניות",
] as const;

export function targetTableEntity(
  table: ImportTargetTable,
): WritableEntity {
  return table;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "fuel",
  "tolls",
  "maintenance",
  "office",
  "insurance",
  "software",
  "other",
];
