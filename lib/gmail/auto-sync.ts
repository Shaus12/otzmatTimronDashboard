import "server-only";
import { getServiceDataStore } from "@/lib/data";
import type { ExpenseCategory } from "@/lib/data/types";
import {
  GMAIL_PROVIDER,
  getOAuthConnection,
  updateGmailLastSyncedAt,
} from "@/lib/gmail/connections";
import {
  fetchRecentInvoiceLikeMessagesWithBody,
} from "@/lib/gmail/oauth";
import { parseExpenseCandidate } from "@/lib/gmail/parse-expense";
import {
  importedGmailMessageIds,
} from "@/lib/gmail/expense-candidates";
import { createSystemImportBatch } from "@/lib/imports/store";

const ALLOWED_CATEGORIES = new Set<ExpenseCategory>([
  "fuel",
  "tolls",
  "maintenance",
  "office",
  "insurance",
  "software",
  "other",
]);

export type GmailAutoSyncResult = {
  inserted: number;
  skipped: number;
  /** True when sync did not run (disabled / not connected). */
  skippedRun: boolean;
  error?: string;
};

/**
 * Unattended Gmail → expenses sync. Inserts parseable messages as needs_review.
 * Skips already-imported external_ids. Logs a gmail-auto-sync import_batches row.
 */
export async function runGmailAutoSync(): Promise<GmailAutoSyncResult> {
  const connection = await getOAuthConnection(GMAIL_PROVIDER);
  if (!connection) {
    return {
      inserted: 0,
      skipped: 0,
      skippedRun: true,
      error: "Gmail לא מחובר",
    };
  }
  if (!connection.gmailSyncEnabled) {
    return {
      inserted: 0,
      skipped: 0,
      skippedRun: true,
      error: "סנכרון אוטומטי כבוי",
    };
  }

  const store = await getServiceDataStore();
  let inserted = 0;
  let skipped = 0;
  let runError: string | undefined;

  try {
    const existing = await store.getExpenses();
    const already = importedGmailMessageIds(existing);

    const after = connection.lastSyncedAt
      ? new Date(connection.lastSyncedAt)
      : null;
    // Over-fetch; external_id filter removes already-imported.
    const messages = await fetchRecentInvoiceLikeMessagesWithBody(40, {
      after,
    });

    for (const m of messages) {
      if (already.has(m.id)) {
        skipped += 1;
        continue;
      }

      const candidate = parseExpenseCandidate({
        messageId: m.id,
        from: m.from,
        subject: m.subject,
        dateHeader: m.date,
        internalDate: m.internalDate,
        snippet: m.snippet,
        bodyText: m.bodyText,
      });

      if (
        !candidate.vendor?.trim() ||
        candidate.amount == null ||
        !Number.isFinite(candidate.amount) ||
        candidate.amount < 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(candidate.date)
      ) {
        skipped += 1;
        continue;
      }

      const category = ALLOWED_CATEGORIES.has(candidate.category)
        ? candidate.category
        : "other";

      try {
        await store.createExpense({
          category,
          amount: candidate.amount,
          vehicleId: null,
          employeeId: null,
          clientId: null,
          projectId: null,
          vendor: candidate.vendor.trim().slice(0, 120),
          description: (candidate.description || candidate.rawSubject).slice(
            0,
            500,
          ),
          status: "needs_review",
          source: "gmail",
          currency: (candidate.currency || "ILS").slice(0, 8),
          incurredOn: candidate.date,
          externalId: candidate.messageId,
          anomalyFlag: null,
        });
        already.add(candidate.messageId);
        inserted += 1;
      } catch (e) {
        // Unique external_id race / already imported — count as skipped.
        const msg = e instanceof Error ? e.message : String(e);
        if (/duplicate|unique|23505/i.test(msg)) {
          skipped += 1;
          continue;
        }
        throw e;
      }
    }
  } catch (e) {
    runError = e instanceof Error ? e.message : String(e);
  }

  const syncedAt = new Date().toISOString();
  try {
    await updateGmailLastSyncedAt(GMAIL_PROVIDER, syncedAt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    runError = runError ? `${runError}; last_synced_at: ${msg}` : msg;
  }

  try {
    await createSystemImportBatch({
      sourceName: "gmail-auto-sync",
      targetTable: "expenses",
      fileName: runError
        ? `error · ${syncedAt.slice(0, 19)}`
        : `sync · ${syncedAt.slice(0, 19)}`,
      rowCount: inserted,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    runError = runError ? `${runError}; batch log: ${msg}` : msg;
  }

  return {
    inserted,
    skipped,
    skippedRun: false,
    error: runError,
  };
}
