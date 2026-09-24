"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getServiceDataStore } from "@/lib/data";
import { toUserFacingError } from "@/lib/errors";
import {
  buildCollectionRows,
  collectionTaskDraft,
} from "@/lib/collections/status";
import type { InvoiceStatus } from "@/lib/data/types";

async function requireInvoicesWrite() {
  const profile = await getCurrentProfile();
  if (!profile || !canWrite(profile.role, "invoices")) {
    throw new Error("אין הרשאה לעריכת חשבוניות");
  }
  return profile;
}

export async function markInvoicePaidAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await requireInvoicesWrite();
    const store = await getServiceDataStore();
    const invoices = await store.getInvoices();
    const current = invoices.find((i) => i.id === id);
    if (!current) return { error: "החשבונית לא נמצאה" };

    await store.updateInvoice(id, {
      ...current,
      status: "paid",
    });
    revalidatePath("/collections");
    revalidatePath("/attention");
    revalidatePath("/reports");
    revalidatePath("/");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

export async function updateInvoiceStatusAction(
  id: string,
  status: InvoiceStatus,
): Promise<{ error?: string }> {
  try {
    await requireInvoicesWrite();
    if (!["open", "paid", "overdue"].includes(status)) {
      return { error: "סטטוס לא תקין" };
    }
    const store = await getServiceDataStore();
    const invoices = await store.getInvoices();
    const current = invoices.find((i) => i.id === id);
    if (!current) return { error: "החשבונית לא נמצאה" };

    await store.updateInvoice(id, { ...current, status });
    revalidatePath("/collections");
    revalidatePath("/attention");
    revalidatePath("/");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

/**
 * Link (or unlink) an invoice to a clients row.
 * Does not rewrite client_name — kept as free-text fallback for unlinked rows.
 */
export async function updateInvoiceClientAction(
  id: string,
  clientId: string | null,
): Promise<{ error?: string }> {
  try {
    await requireInvoicesWrite();
    const store = await getServiceDataStore();
    const invoices = await store.getInvoices();
    const current = invoices.find((i) => i.id === id);
    if (!current) return { error: "החשבונית לא נמצאה" };

    if (clientId) {
      const clients = await store.getClients();
      if (!clients.some((c) => c.id === clientId)) {
        return { error: "הלקוח לא נמצא" };
      }
    }

    await store.updateInvoice(id, { ...current, clientId });
    revalidatePath("/collections");
    revalidatePath("/attention");
    revalidatePath("/");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

/**
 * Creates an open collection task pre-filled from the invoice.
 * Allowed for anyone who can write invoices or tasks (admin / accounting).
 */
export async function openCollectionTaskAction(
  invoiceId: string,
): Promise<{ taskId?: string; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (
      !profile ||
      (!canWrite(profile.role, "tasks") && !canWrite(profile.role, "invoices"))
    ) {
      return { error: "אין הרשאה לפתיחת משימת גבייה" };
    }

    const store = await getServiceDataStore();
    const [invoices, payments, clients] = await Promise.all([
      store.getInvoices(),
      store.getPayments(),
      store.getClients(),
    ]);
    const row = buildCollectionRows(invoices, payments, clients).find(
      (r) => r.invoice.id === invoiceId,
    );
    if (!row) return { error: "החשבונית לא נמצאה" };
    if (row.status === "paid") {
      return { error: "לא ניתן לפתוח משימת גבייה לחשבונית ששולמה" };
    }

    const draft = collectionTaskDraft(row);
    const task = await store.createTask({
      title: draft.title.slice(0, 200),
      description: draft.description.slice(0, 2000),
      status: "open",
      dueDate: row.invoice.dueDate,
      assignedTo: null,
    });

    revalidatePath("/tasks");
    revalidatePath("/collections");
    revalidatePath("/");
    return { taskId: task.id };
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}
