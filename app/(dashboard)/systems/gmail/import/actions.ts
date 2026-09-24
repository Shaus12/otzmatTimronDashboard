"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getDataStore } from "@/lib/data";

export type ImportGmailExpenseRow = {
  messageId: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  category?: string;
  rawSubject: string;
};

export async function importGmailExpensesAction(
  rows: ImportGmailExpenseRow[],
): Promise<{ imported: number; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { imported: 0, error: "רק מנהל יכול לייבא הוצאות מ־Gmail" };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { imported: 0, error: "לא נבחרו שורות" };
  }
  if (rows.length > 50) {
    return { imported: 0, error: "יותר מדי שורות בבקשה אחת" };
  }

  const store = await getDataStore();
  let imported = 0;
  const allowed = new Set([
    "fuel",
    "tolls",
    "maintenance",
    "office",
    "insurance",
    "software",
    "other",
  ]);

  for (const row of rows) {
    if (
      !row.vendor?.trim() ||
      !Number.isFinite(row.amount) ||
      row.amount < 0 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.date)
    ) {
      continue;
    }

    const category =
      row.category && allowed.has(row.category)
        ? (row.category as
            | "fuel"
            | "tolls"
            | "maintenance"
            | "office"
            | "insurance"
            | "software"
            | "other")
        : "other";

    await store.createExpense({
      category,
      amount: row.amount,
      vehicleId: null,
      employeeId: null,
      clientId: null,
      projectId: null,
      vendor: row.vendor.trim().slice(0, 120),
      description: (row.description || row.rawSubject).slice(0, 500),
      status: "needs_review",
      source: "gmail",
      currency: (row.currency || "ILS").slice(0, 8),
      incurredOn: row.date,
      externalId: row.messageId || null,
      anomalyFlag: null,
    });
    imported += 1;
  }

  revalidatePath("/systems/gmail/import");
  revalidatePath("/expenses");
  revalidatePath("/");
  return { imported };
}
