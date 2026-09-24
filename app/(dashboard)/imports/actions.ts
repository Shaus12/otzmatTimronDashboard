"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { toUserFacingError } from "@/lib/errors";
import type { ExpenseCategory } from "@/lib/data/types";
import {
  createImportBatch,
  listImportBatches,
  listImportTemplates,
  upsertImportTemplate,
} from "@/lib/imports/store";
import type {
  ColumnMapping,
  ImportTargetTable,
  MappedImportRow,
} from "@/lib/imports/types";
import { targetTableEntity } from "@/lib/imports/types";

function canAccessImports(role: string | undefined): boolean {
  return role === "admin" || role === "accounting";
}

export async function getImportPageDataAction() {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessImports(profile.role)) {
    return { error: "אין הרשאה", templates: [], batches: [], expenses: [] };
  }
  try {
    const store = await getDataStore();
    const [templates, batches, expenses] = await Promise.all([
      listImportTemplates(),
      listImportBatches(),
      store.getExpenses(),
    ]);
    return { templates, batches, expenses, error: null as string | null };
  } catch (e) {
    return {
      templates: [],
      batches: [],
      expenses: [],
      error: e instanceof Error ? e.message : "שגיאה בטעינת נתוני ייבוא",
    };
  }
}

export async function saveImportTemplateAction(input: {
  sourceName: string;
  targetTable: ImportTargetTable;
  columnMapping: ColumnMapping;
}): Promise<{ error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessImports(profile.role)) {
    return { error: "אין הרשאה" };
  }
  if (!canWrite(profile.role, targetTableEntity(input.targetTable))) {
    return { error: "אין הרשאה לטבלת היעד" };
  }
  const name = input.sourceName.trim();
  if (!name) return { error: "יש להזין שם מקור" };
  try {
    await upsertImportTemplate({
      sourceName: name,
      targetTable: input.targetTable,
      columnMapping: input.columnMapping,
      createdBy: profile.id,
    });
    revalidatePath("/imports");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "שמירת התבנית נכשלה" };
  }
}

export type ConfirmImportPayload = {
  sourceName: string;
  targetTable: ImportTargetTable;
  fileName: string;
  columnMapping: ColumnMapping;
  saveTemplate: boolean;
  rows: MappedImportRow[];
};

export async function confirmFileImportAction(
  payload: ConfirmImportPayload,
): Promise<{ imported: number; skipped: number; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessImports(profile.role)) {
    return { imported: 0, skipped: 0, error: "אין הרשאה" };
  }
  if (!canWrite(profile.role, targetTableEntity(payload.targetTable))) {
    return { imported: 0, skipped: 0, error: "אין הרשאה לטבלת היעד" };
  }

  const sourceName = payload.sourceName.trim();
  if (!sourceName) {
    return { imported: 0, skipped: 0, error: "יש להזין שם מקור" };
  }
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
    return { imported: 0, skipped: 0, error: "אין שורות לייבוא" };
  }
  if (payload.rows.length > 2000) {
    return { imported: 0, skipped: 0, error: "יותר מדי שורות (מקסימום 2000)" };
  }

  const store = await getDataStore();
  let imported = 0;
  let skipped = 0;

  try {
    if (payload.saveTemplate) {
      await upsertImportTemplate({
        sourceName,
        targetTable: payload.targetTable,
        columnMapping: payload.columnMapping,
        createdBy: profile.id,
      });
    }

    for (const row of payload.rows) {
      if (row.errors.length || row.amount == null || !row.date) {
        skipped += 1;
        continue;
      }

      if (payload.targetTable === "expenses") {
        if (!row.vendor.trim()) {
          skipped += 1;
          continue;
        }
        await store.createExpense({
          category: (row.category as ExpenseCategory) || "other",
          amount: row.amount,
          vehicleId: null,
          employeeId: null,
          clientId: null,
          projectId: null,
          vendor: row.vendor.trim().slice(0, 120),
          description: (row.description || "").slice(0, 500),
          status: "needs_review",
          source: sourceName,
          currency: "ILS",
          incurredOn: row.date,
          externalId: null,
          anomalyFlag: null,
        });
        imported += 1;
      } else if (payload.targetTable === "fines") {
        const title =
          row.title.trim() ||
          row.description.trim().slice(0, 80) ||
          `ייבוא · ${sourceName}`;
        await store.createFine({
          title: title.slice(0, 200),
          description: (row.description || title).slice(0, 500),
          amount: row.amount,
          status: "open",
          dueDate: row.date,
          vehicleId: null,
          employeeId: null,
        });
        imported += 1;
      } else {
        const clientName = row.clientName.trim();
        if (!clientName) {
          skipped += 1;
          continue;
        }
        await store.createInvoice({
          status: "open",
          amount: row.amount,
          dueDate: row.date,
          clientName: clientName.slice(0, 200),
          clientId: null,
        });
        imported += 1;
      }
    }

    await createImportBatch({
      sourceName,
      targetTable: payload.targetTable,
      fileName: payload.fileName || "upload",
      rowCount: imported,
      importedBy: profile.id,
    });

    revalidatePath("/imports");
    revalidatePath("/fines");
    return { imported, skipped };
  } catch (e) {
    return {
      imported,
      skipped,
      error: toUserFacingError(e),
    };
  }
}
