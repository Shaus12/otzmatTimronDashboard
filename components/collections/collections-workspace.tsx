"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  markInvoicePaidAction,
  openCollectionTaskAction,
  updateInvoiceClientAction,
  updateInvoiceStatusAction,
} from "@/app/(dashboard)/collections/actions";
import type { CollectionRow } from "@/lib/collections/status";
import {
  collectionClientStatusLabels,
  invoiceStatusLabels,
} from "@/lib/collections/status";
import type { Client, InvoiceStatus } from "@/lib/data/types";
import { formatDate, formatMoney } from "@/lib/labels";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "סטטוס: הכל" },
  { value: "open", label: invoiceStatusLabels.open },
  { value: "overdue", label: invoiceStatusLabels.overdue },
  { value: "paid", label: invoiceStatusLabels.paid },
];

export function CollectionsWorkspace({
  rows,
  clients,
  canWrite,
  canOpenTask,
}: {
  rows: CollectionRow[];
  clients: Client[];
  canWrite: boolean;
  canOpenTask: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<CollectionRow | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (overdueOnly && r.status !== "overdue") return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, statusFilter, overdueOnly]);

  const run = (
    invoiceId: string,
    fn: () => Promise<{ error?: string; taskId?: string }>,
  ) => {
    setError(null);
    setInfo(null);
    setBusyId(invoiceId);
    startTransition(async () => {
      const result = await fn();
      setBusyId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.taskId) {
        setInfo("משימת גבייה נפתחה");
      }
      router.refresh();
    });
  };

  async function confirmMarkPaid() {
    if (!payTarget) return;
    setError(null);
    setInfo(null);
    const invoiceId = payTarget.invoice.id;
    const result = await markInvoicePaidAction(invoiceId);
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    setPayTarget(null);
    router.refresh();
  }

  return (
    <div className="collections-layout">
      <div className="expenses-toolbar">
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="סינון סטטוס"
        >
          {STATUS_FILTERS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
        <label className="collections-overdue-toggle">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          באיחור בלבד
        </label>
        <span className="expenses-toolbar-count">
          {filtered.length}/{rows.length}
        </span>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {info ? (
        <p className="adapter-status-message">
          {info}{" "}
          <Link href="/tasks" className="text-button">
            למשימות →
          </Link>
        </p>
      ) : null}

      <section className="timewatch-summary">
        {!filtered.length ? (
          <p>אין חשבוניות תואמות לסינון.</p>
        ) : (
          <div className="records-table-wrap expenses-table-wrap">
            <table className="records-table expenses-table collections-table">
              <thead>
                <tr>
                  <th>לקוח</th>
                  <th>שיוך לקוח</th>
                  <th>סכום</th>
                  <th>שולם</th>
                  <th>יתרה</th>
                  <th>סטטוס</th>
                  <th>תאריך יעד</th>
                  <th>ימי פיגור</th>
                  <th>סיווג</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const busy = busyId === r.invoice.id || pending;
                  return (
                    <tr key={r.invoice.id}>
                      <td dir="auto">{r.displayClientName}</td>
                      <td>
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={r.invoice.clientId ?? ""}
                            disabled={busy}
                            onChange={(ev) => {
                              const clientId = ev.target.value || null;
                              run(r.invoice.id, () =>
                                updateInvoiceClientAction(
                                  r.invoice.id,
                                  clientId,
                                ),
                              );
                            }}
                          >
                            <option value="">טקסט חופשי בלבד</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : r.invoice.clientId ? (
                          "מקושר"
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{formatMoney(r.invoice.amount, "ILS")}</td>
                      <td>{formatMoney(r.paidTotal, "ILS")}</td>
                      <td>{formatMoney(r.balance, "ILS")}</td>
                      <td>
                          {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={r.status}
                            disabled={busy}
                            onChange={(ev) => {
                              const status = ev.target.value as InvoiceStatus;
                              // Same sensitive action as "סמן כשולם" — confirm first.
                              if (status === "paid") {
                                setPayTarget(r);
                                return;
                              }
                              run(r.invoice.id, () =>
                                updateInvoiceStatusAction(r.invoice.id, status),
                              );
                            }}
                          >
                            {(Object.keys(invoiceStatusLabels) as InvoiceStatus[]).map(
                              (s) => (
                                <option key={s} value={s}>
                                  {invoiceStatusLabels[s]}
                                </option>
                              ),
                            )}
                          </NativeSelect>
                        ) : (
                          <span
                            className={`status-badge collection-status status-${r.status}`}
                          >
                            {invoiceStatusLabels[r.status]}
                          </span>
                        )}
                      </td>
                      <td>{formatDate(r.invoice.dueDate)}</td>
                      <td>{r.daysOverdue > 0 ? r.daysOverdue : "—"}</td>
                      <td>
                        <span
                          className={`status-badge collection-client client-${r.clientStatus}`}
                        >
                          {collectionClientStatusLabels[r.clientStatus]}
                        </span>
                      </td>
                      <td>
                        <div className="collections-actions">
                          {canWrite && r.status !== "paid" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setError(null);
                                setPayTarget(r);
                              }}
                            >
                              סמן כשולם
                            </Button>
                          ) : null}
                          {canOpenTask && r.status === "overdue" ? (
                            <Button
                              type="button"
                              size="sm"
                              className="primary-action"
                              disabled={busy}
                              onClick={() =>
                                run(r.invoice.id, () =>
                                  openCollectionTaskAction(r.invoice.id),
                                )
                              }
                            >
                              פתח משימת גבייה
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={payTarget != null}
        onOpenChange={(open) => {
          if (!open) setPayTarget(null);
        }}
        title="לסמן את החשבונית כשולמה?"
        description={
          payTarget
            ? `״${payTarget.displayClientName}״ · ${formatMoney(payTarget.invoice.amount, "ILS")}. פעולה זו משנה את סטטוס הגבייה.`
            : "פעולה זו משנה את סטטוס הגבייה."
        }
        confirmLabel="סמן כשולם"
        tone="primary"
        onConfirm={confirmMarkPaid}
      />
    </div>
  );
}
