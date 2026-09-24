import type {
  Client,
  Invoice,
  InvoiceStatus,
  Payment,
} from "@/lib/data/types";
import { formatMoney } from "@/lib/labels";

/** Spec classification — derived from days overdue, not stored. */
export type CollectionClientStatus =
  | "ok"
  | "late"
  | "needs_call"
  | "legal";

export type CollectionRow = {
  invoice: Invoice;
  /** Linked client name when client_id is set; else free-text client_name. */
  displayClientName: string;
  /** Effective status for filters/UI (stored status; overdue may also be computed). */
  status: InvoiceStatus;
  daysOverdue: number;
  clientStatus: CollectionClientStatus;
  paidTotal: number;
  balance: number;
  payments: Payment[];
};

export const collectionClientStatusLabels: Record<
  CollectionClientStatus,
  string
> = {
  ok: "תקין",
  late: "בפיגור",
  needs_call: "דורש שיחה",
  legal: "משפטי",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  open: "פתוח",
  paid: "שולם",
  overdue: "באיחור",
};

function dayKeyJerusalem(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Calendar days past due_date; 0 if not due yet, paid, or no due date. */
export function daysOverdue(
  invoice: Pick<Invoice, "status" | "dueDate">,
  today = dayKeyJerusalem(),
): number {
  if (invoice.status === "paid") return 0;
  const due = invoice.dueDate?.slice(0, 10) ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return 0;
  if (due >= today) return 0;
  const dueMs = new Date(`${due}T12:00:00`).getTime();
  const todayMs = new Date(`${today}T12:00:00`).getTime();
  return Math.max(0, Math.round((todayMs - dueMs) / 86_400_000));
}

/**
 * תקין / בפיגור / דורש שיחה / משפטי from days overdue.
 * 0 = תקין, 1–30 = בפיגור, 31–60 = דורש שיחה, 60+ = משפטי.
 */
export function classifyCollectionClient(
  days: number,
): CollectionClientStatus {
  if (days <= 0) return "ok";
  if (days <= 30) return "late";
  if (days <= 60) return "needs_call";
  return "legal";
}

/** Prefer stored overdue; otherwise treat past-due unpaid as overdue for UI. */
export function effectiveInvoiceStatus(
  invoice: Invoice,
  days: number,
): InvoiceStatus {
  if (invoice.status === "paid") return "paid";
  if (invoice.status === "overdue" || days > 0) return "overdue";
  if (invoice.status === "open") return "open";
  // Legacy draft/sent rows (if any) surface as open.
  return "open";
}

export function invoiceDisplayClientName(
  invoice: Invoice,
  clientsById?: Map<string, Client> | Client[],
): string {
  if (invoice.clientId && clientsById) {
    const map =
      clientsById instanceof Map
        ? clientsById
        : new Map(clientsById.map((c) => [c.id, c]));
    const linked = map.get(invoice.clientId);
    if (linked?.name) return linked.name;
  }
  return invoice.clientName || "";
}

export function buildCollectionRows(
  invoices: Invoice[],
  payments: Payment[],
  clients: Client[] = [],
  today = dayKeyJerusalem(),
): CollectionRow[] {
  const paymentsByInvoice = new Map<string, Payment[]>();
  for (const p of payments) {
    if (!p.invoiceId) continue;
    const list = paymentsByInvoice.get(p.invoiceId) ?? [];
    list.push(p);
    paymentsByInvoice.set(p.invoiceId, list);
  }
  const clientsById = new Map(clients.map((c) => [c.id, c]));

  return invoices
    .map((invoice) => {
      const days = daysOverdue(invoice, today);
      const status = effectiveInvoiceStatus(invoice, days);
      const invPayments = paymentsByInvoice.get(invoice.id) ?? [];
      const paidTotal = invPayments.reduce((s, p) => s + p.amount, 0);
      return {
        invoice,
        displayClientName:
          invoiceDisplayClientName(invoice, clientsById) || "—",
        status,
        daysOverdue: status === "paid" ? 0 : days,
        clientStatus: classifyCollectionClient(
          status === "paid" ? 0 : days,
        ),
        paidTotal,
        balance: Math.max(0, invoice.amount - paidTotal),
        payments: invPayments,
      };
    })
    .sort((a, b) => {
      // Overdue first (by days desc), then open, then paid.
      if (a.status !== b.status) {
        const order = { overdue: 0, open: 1, paid: 2 } as const;
        return order[a.status] - order[b.status];
      }
      return b.daysOverdue - a.daysOverdue;
    });
}

export function collectionTaskDraft(row: CollectionRow): {
  title: string;
  description: string;
} {
  const amount = formatMoney(row.invoice.amount, "ILS");
  const client = row.displayClientName || row.invoice.clientName || "לקוח";
  return {
    title: `גבייה · ${client}`,
    description: [
      `משימת גבייה עבור ${client}.`,
      `סכום חשבונית: ${amount}.`,
      row.paidTotal > 0
        ? `שולם עד כה: ${formatMoney(row.paidTotal, "ILS")}. יתרה: ${formatMoney(row.balance, "ILS")}.`
        : null,
      row.daysOverdue > 0 ? `ימי פיגור: ${row.daysOverdue}.` : null,
      `סטטוס לקוח: ${collectionClientStatusLabels[row.clientStatus]}.`,
      `חשבונית: ${row.invoice.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
