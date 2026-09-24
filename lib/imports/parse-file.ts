import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedSheet } from "./types";

function normalizeHeader(value: unknown, index: number): string {
  const raw = String(value ?? "").trim();
  return raw || `עמודה_${index + 1}`;
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel serial date heuristic (days since 1899-12-30).
    if (value > 20000 && value < 60000 && Number.isInteger(value)) {
      const epoch = Date.UTC(1899, 11, 30) + value * 86400000;
      return new Date(epoch).toISOString().slice(0, 10);
    }
    return String(value);
  }
  return String(value).trim();
}

function sheetToParsed(
  fileName: string,
  matrix: unknown[][],
): ParsedSheet {
  if (!matrix.length) {
    return { fileName, headers: [], rows: [] };
  }
  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((h, i) => normalizeHeader(h, i));
  // Deduplicate headers
  const seen = new Map<string, number>();
  const uniqueHeaders = headers.map((h) => {
    const n = (seen.get(h) ?? 0) + 1;
    seen.set(h, n);
    return n === 1 ? h : `${h}_${n}`;
  });

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r] ?? [];
    if (line.every((c) => cellToString(c) === "")) continue;
    const row: Record<string, string> = {};
    uniqueHeaders.forEach((h, i) => {
      row[h] = cellToString(line[i]);
    });
    rows.push(row);
  }
  return { fileName, headers: uniqueHeaders, rows };
}

export async function parseImportFile(file: File): Promise<ParsedSheet> {
  const name = file.name || "upload";
  const lower = name.toLowerCase();

  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || file.type === "text/csv") {
    const text = await file.text();
    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });
    if (result.errors.length && !result.data.length) {
      throw new Error(result.errors[0]?.message || "שגיאה בפענוח CSV");
    }
    return sheetToParsed(name, result.data as unknown[][]);
  }

  if (
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsm") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  ) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("הקובץ לא מכיל גיליונות");
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    return sheetToParsed(name, matrix);
  }

  throw new Error("נתמכים רק קבצי CSV או Excel (.xlsx / .xls)");
}
