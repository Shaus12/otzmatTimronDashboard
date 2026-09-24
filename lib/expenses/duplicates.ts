import type { Expense } from "@/lib/data/types";

export function normalizeVendor(vendor: string): string {
  return vendor.trim().toLowerCase().replace(/\s+/g, " ");
}

export function amountsEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005;
}

function incurredOnKey(value: string | null | undefined): string {
  if (!value) return "";
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : "";
}

export type DuplicateMatch = {
  expenseId: string;
  vendor: string;
  amount: number;
  incurredOn: string;
};

/**
 * Flag (do not block) when the same vendor + amount + incurred_on already exists in DB.
 */
export function findDuplicateExpenses(
  existing: Expense[],
  candidate: { vendor: string; amount: number; incurredOn: string },
): DuplicateMatch[] {
  const vendor = normalizeVendor(candidate.vendor);
  const incurredOn = incurredOnKey(candidate.incurredOn);
  if (!vendor || !incurredOn) return [];

  return existing
    .filter(
      (e) =>
        normalizeVendor(e.vendor) === vendor &&
        amountsEqual(e.amount, candidate.amount) &&
        incurredOnKey(e.incurredOn) === incurredOn,
    )
    .map((e) => ({
      expenseId: e.id,
      vendor: e.vendor,
      amount: e.amount,
      incurredOn: incurredOnKey(e.incurredOn),
    }));
}

/**
 * Within-batch near-duplicates: same vendor + amount (dates may differ).
 * Returns peer 1-based display numbers for each row index that has at least one peer.
 */
export function findBatchNearDuplicatePeers(
  rows: Array<{ rowIndex: number; vendor: string; amount: number | null }>,
): Map<number, number[]> {
  const byKey = new Map<string, number[]>();
  for (const row of rows) {
    if (row.amount == null || !row.vendor.trim()) continue;
    const key = `${normalizeVendor(row.vendor)}|${row.amount.toFixed(2)}`;
    const list = byKey.get(key) ?? [];
    list.push(row.rowIndex);
    byKey.set(key, list);
  }

  const peers = new Map<number, number[]>();
  for (const indexes of byKey.values()) {
    if (indexes.length < 2) continue;
    for (const idx of indexes) {
      peers.set(
        idx,
        indexes.filter((other) => other !== idx).map((i) => i + 1),
      );
    }
  }
  return peers;
}
