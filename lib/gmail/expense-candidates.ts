import "server-only";
import { fetchRecentInvoiceLikeMessagesWithBody } from "@/lib/gmail/oauth";
import {
  parseExpenseCandidate,
  type GmailExpenseCandidate,
} from "@/lib/gmail/parse-expense";
import { findDuplicateExpenses } from "@/lib/expenses/duplicates";
import type { Expense } from "@/lib/data/types";

export type GmailExpenseCandidatePreview = GmailExpenseCandidate & {
  isDuplicate: boolean;
  duplicateExpenseIds: string[];
};

/** Parse matched Gmail messages into expense candidates (no DB writes).
 * Excludes messages whose ids were already imported (expenses.external_id).
 */
export async function fetchGmailExpenseCandidates(
  maxResults = 25,
  alreadyImportedIds: ReadonlySet<string> = new Set(),
): Promise<GmailExpenseCandidate[]> {
  // Over-fetch a bit so filtering imported ids still leaves a useful preview.
  const messages = await fetchRecentInvoiceLikeMessagesWithBody(
    Math.min(maxResults + alreadyImportedIds.size, 50),
  );
  return messages
    .filter((m) => !alreadyImportedIds.has(m.id))
    .slice(0, maxResults)
    .map((m) =>
      parseExpenseCandidate({
        messageId: m.id,
        from: m.from,
        subject: m.subject,
        dateHeader: m.date,
        internalDate: m.internalDate,
        snippet: m.snippet,
        bodyText: m.bodyText,
      }),
    );
}

export function importedGmailMessageIds(expenses: Expense[]): Set<string> {
  const ids = new Set<string>();
  for (const e of expenses) {
    if (e.source === "gmail" && e.externalId) ids.add(e.externalId);
  }
  return ids;
}

export function annotateDuplicates(
  candidates: GmailExpenseCandidate[],
  existing: Expense[],
): GmailExpenseCandidatePreview[] {
  return candidates.map((c) => {
    if (c.amount == null) {
      return { ...c, isDuplicate: false, duplicateExpenseIds: [] };
    }
    const matches = findDuplicateExpenses(existing, {
      vendor: c.vendor,
      amount: c.amount,
      incurredOn: c.date,
    });
    return {
      ...c,
      isDuplicate: matches.length > 0,
      duplicateExpenseIds: matches.map((m) => m.expenseId),
    };
  });
}
