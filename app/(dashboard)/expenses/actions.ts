"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getServiceDataStore } from "@/lib/data";
import { detectExpenseAnomaly } from "@/lib/expenses/anomalies";
import { toUserFacingError } from "@/lib/errors";
import type {
  ExpenseCategory,
  ExpenseStatus,
} from "@/lib/data/types";

async function requireExpensesWrite() {
  const profile = await getCurrentProfile();
  if (!profile || !canWrite(profile.role, "expenses")) {
    throw new Error("אין הרשאה לעריכת הוצאות");
  }
  return profile;
}

/**
 * Expense mutations use the service-role store after an app-level canWrite check.
 * Session-scoped UPDATE on expenses is blocked by RLS until
 * 20260923160000_expenses_update_policy.sql is applied.
 */
async function expensesWriteStore() {
  return getServiceDataStore();
}

export async function updateExpenseFieldsAction(
  id: string,
  patch: {
    status?: ExpenseStatus;
    category?: ExpenseCategory;
    employeeId?: string | null;
    vehicleId?: string | null;
    clientId?: string | null;
    projectId?: string | null;
  },
): Promise<{ error?: string }> {
  try {
    await requireExpensesWrite();
    const store = await expensesWriteStore();
    const expenses = await store.getExpenses();
    const current = expenses.find((e) => e.id === id);
    if (!current) return { error: "ההוצאה לא נמצאה" };

    await store.updateExpense(id, {
      category: patch.category ?? current.category,
      amount: current.amount,
      vehicleId:
        patch.vehicleId !== undefined ? patch.vehicleId : current.vehicleId,
      description: current.description,
      vendor: current.vendor,
      employeeId:
        patch.employeeId !== undefined ? patch.employeeId : current.employeeId,
      clientId:
        patch.clientId !== undefined ? patch.clientId : current.clientId,
      projectId:
        patch.projectId !== undefined ? patch.projectId : current.projectId,
      status: patch.status ?? current.status,
      source: current.source,
      currency: current.currency,
      incurredOn: current.incurredOn,
      externalId: current.externalId,
      anomalyFlag: current.anomalyFlag,
    });
    revalidatePath("/expenses");
    revalidatePath("/attention");
    revalidatePath("/reports");
    revalidatePath("/");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

export async function bulkUpdateExpenseStatusAction(
  ids: string[],
  status: ExpenseStatus,
): Promise<{ updated: number; error?: string }> {
  try {
    await requireExpensesWrite();
    if (!Array.isArray(ids) || ids.length === 0) {
      return { updated: 0, error: "לא נבחרו שורות" };
    }
    if (ids.length > 500) {
      return { updated: 0, error: "יותר מדי שורות" };
    }

    const store = await expensesWriteStore();
    const expenses = await store.getExpenses();
    const byId = new Map(expenses.map((e) => [e.id, e]));
    let updated = 0;

    for (const id of ids) {
      const current = byId.get(id);
      if (!current) continue;
      await store.updateExpense(id, {
        category: current.category,
        amount: current.amount,
        vehicleId: current.vehicleId,
        description: current.description,
        vendor: current.vendor,
        employeeId: current.employeeId,
        clientId: current.clientId,
        projectId: current.projectId,
        status,
        source: current.source,
        currency: current.currency,
        incurredOn: current.incurredOn,
        externalId: current.externalId,
        anomalyFlag: current.anomalyFlag,
      });
      updated += 1;
    }

    revalidatePath("/expenses");
    revalidatePath("/attention");
    revalidatePath("/reports");
    revalidatePath("/");
    return { updated };
  } catch (e) {
    return { updated: 0, error: toUserFacingError(e) };
  }
}

/**
 * Re-run anomaly rules on all expenses. Informational only — does not change status.
 */
export async function scanExpenseAnomaliesAction(): Promise<{
  flagged: number;
  cleared: number;
  error?: string;
}> {
  try {
    await requireExpensesWrite();
    const store = await expensesWriteStore();
    const expenses = await store.getExpenses();
    let flagged = 0;
    let cleared = 0;

    for (const current of expenses) {
      const others = expenses.filter((e) => e.id !== current.id);
      const anomalyFlag = detectExpenseAnomaly(current, others);
      if (anomalyFlag === current.anomalyFlag) continue;

      await store.setExpenseAnomalyFlag(current.id, anomalyFlag);

      if (anomalyFlag) flagged += 1;
      else cleared += 1;
    }

    revalidatePath("/expenses");
    revalidatePath("/attention");
    revalidatePath("/reports");
    revalidatePath("/");
    return { flagged, cleared };
  } catch (e) {
    return { flagged: 0, cleared: 0, error: toUserFacingError(e) };
  }
}
