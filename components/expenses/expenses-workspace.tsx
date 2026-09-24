"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/records/records-table";
import { ExpenseDocumentsDialog } from "@/components/expenses/expense-documents-dialog";
import {
  updateExpenseFieldsAction,
  bulkUpdateExpenseStatusAction,
  scanExpenseAnomaliesAction,
} from "@/app/(dashboard)/expenses/actions";
import type {
  Client,
  Employee,
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  Project,
  Vehicle,
} from "@/lib/data/types";
import {
  expenseAnomalyLabels,
  expenseCategoryLabels,
  expenseStatusLabels,
  formatDate,
  formatMoney,
} from "@/lib/labels";

const STATUS_OPTIONS = Object.keys(expenseStatusLabels) as ExpenseStatus[];
const CATEGORY_OPTIONS = Object.keys(
  expenseCategoryLabels,
) as ExpenseCategory[];

type FieldPatch = {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  employeeId?: string | null;
  vehicleId?: string | null;
  clientId?: string | null;
  projectId?: string | null;
};

export function ExpensesWorkspace({
  expenses,
  employees,
  vehicles,
  clients,
  projects,
  canWrite,
}: {
  expenses: Expense[];
  employees: Employee[];
  vehicles: Vehicle[];
  clients: Client[];
  projects: Project[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  /** Optimistic per-row edits so selects don't snap back before refresh. */
  const [overrides, setOverrides] = useState<Record<string, FieldPatch>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<ExpenseStatus>("needs_review");
  const [docsExpense, setDocsExpense] = useState<Expense | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) if (e.source) set.add(e.source);
    return [...set].sort((a, b) => a.localeCompare(b, "he"));
  }, [expenses]);

  const rows = useMemo(() => {
    return expenses.map((e) => {
      const o = overrides[e.id];
      if (!o) return e;
      return {
        ...e,
        status: o.status ?? e.status,
        category: o.category ?? e.category,
        employeeId: o.employeeId !== undefined ? o.employeeId : e.employeeId,
        vehicleId: o.vehicleId !== undefined ? o.vehicleId : e.vehicleId,
        clientId: o.clientId !== undefined ? o.clientId : e.clientId,
        projectId: o.projectId !== undefined ? o.projectId : e.projectId,
      };
    });
  }, [expenses, overrides]);

  // Drop overrides once server props catch up.
  useEffect(() => {
    setOverrides((prev) => {
      let changed = false;
      const next: Record<string, FieldPatch> = { ...prev };
      for (const id of Object.keys(next)) {
        const server = expenses.find((e) => e.id === id);
        const o = next[id];
        if (!server || !o) {
          delete next[id];
          changed = true;
          continue;
        }
        const matched =
          (o.status === undefined || o.status === server.status) &&
          (o.category === undefined || o.category === server.category) &&
          (o.employeeId === undefined || o.employeeId === server.employeeId) &&
          (o.vehicleId === undefined || o.vehicleId === server.vehicleId) &&
          (o.clientId === undefined || o.clientId === server.clientId) &&
          (o.projectId === undefined || o.projectId === server.projectId);
        if (matched) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [expenses]);

  const filtered = useMemo(() => {
    return rows.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (sourceFilter !== "all" && e.source !== sourceFilter) return false;
      const day = e.incurredOn?.slice(0, 10) ?? "";
      if (dateFrom && (!day || day < dateFrom)) return false;
      if (dateTo && (!day || day > dateTo)) return false;
      return true;
    });
  }, [rows, statusFilter, categoryFilter, sourceFilter, dateFrom, dateTo]);

  const selectedIds = filtered.filter((e) => selected[e.id]).map((e) => e.id);

  const patch = (id: string, fields: FieldPatch) => {
    setError(null);
    setInfo(null);
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...fields },
    }));
    setSavingIds((prev) => ({ ...prev, [id]: true }));
    startTransition(async () => {
      const result = await updateExpenseFieldsAction(id, fields);
      setSavingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (result.error) {
        setError(result.error);
        // Revert this patch on failure.
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }
      router.refresh();
    });
  };

  const applyBulkStatus = (ids: string[]) => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        next[id] = { ...next[id], status: bulkStatus };
      }
      return next;
    });
    startTransition(async () => {
      const result = await bulkUpdateExpenseStatusAction(ids, bulkStatus);
      if (result.error) {
        setError(result.error);
        setOverrides((prev) => {
          const next = { ...prev };
          for (const id of ids) delete next[id];
          return next;
        });
        return;
      }
      setInfo(`עודכן סטטוס ל־${result.updated} הוצאות`);
      setSelected({});
      router.refresh();
    });
  };

  const onBulkStatus = () => {
    setError(null);
    setInfo(null);
    if (!selectedIds.length) {
      setError("בחרו לפחות שורה אחת");
      return;
    }
    // Confirm only when updating more than one row.
    if (selectedIds.length > 1) {
      setBulkConfirmOpen(true);
      return;
    }
    applyBulkStatus([...selectedIds]);
  };

  const onScanAnomalies = () => {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await scanExpenseAnomaliesAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setInfo(
        `סריקת חריגות: ${result.flagged} סומנו, ${result.cleared} נוקו`,
      );
      router.refresh();
    });
  };

  const toggleAll = (on: boolean) => {
    const next: Record<string, boolean> = { ...selected };
    for (const e of filtered) next[e.id] = on;
    setSelected(next);
  };

  return (
    <div className="expenses-layout">
      <div className="expenses-toolbar">
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="סינון סטטוס"
        >
          <option value="all">סטטוס: הכל</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {expenseStatusLabels[s]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="סינון קטגוריה"
        >
          <option value="all">קטגוריה: הכל</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {expenseCategoryLabels[c]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="סינון מקור"
        >
          <option value="all">מקור: הכל</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="מתאריך"
          className="expenses-toolbar-date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="עד תאריך"
          className="expenses-toolbar-date"
        />
        <span className="expenses-toolbar-count">
          {filtered.length}/{expenses.length}
        </span>

        {canWrite ? (
          <div className="expenses-toolbar-bulk">
            <NativeSelect
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ExpenseStatus)}
              aria-label="סטטוס מרובה"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {expenseStatusLabels[s]}
                </option>
              ))}
            </NativeSelect>
            <Button
              type="button"
              size="sm"
              className="primary-action"
              disabled={pending || selectedIds.length === 0}
              onClick={onBulkStatus}
            >
              עדכון סטטוס ({selectedIds.length})
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={onScanAnomalies}
            >
              סריקת חריגות
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {info ? <p className="adapter-status-message">{info}</p> : null}

      <section className="timewatch-summary">
        {!filtered.length ? (
          <p>אין הוצאות תואמות לסינון.</p>
        ) : (
          <div className="records-table-wrap expenses-table-wrap">
            <table className="records-table expenses-table">
              <thead>
                <tr>
                  {canWrite ? (
                    <th className="expenses-col-check">
                      <input
                        type="checkbox"
                        aria-label="בחר הכל"
                        checked={
                          filtered.length > 0 &&
                          filtered.every((e) => selected[e.id])
                        }
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                  ) : null}
                  <th className="expenses-col-date">תאריך</th>
                  <th className="expenses-col-vendor">ספק</th>
                  <th className="expenses-col-amount">סכום</th>
                  <th className="expenses-col-category">קטגוריה</th>
                  <th className="expenses-col-status">סטטוס</th>
                  <th className="expenses-col-anomaly">חריגה</th>
                  <th className="expenses-col-docs">מסמכים</th>
                  <th className="expenses-col-employee">עובד</th>
                  <th className="expenses-col-vehicle">רכב</th>
                  <th className="expenses-col-client">לקוח</th>
                  <th className="expenses-col-project">פרויקט</th>
                  <th className="expenses-col-source">מקור</th>
                  <th className="expenses-col-desc">תיאור</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const rowBusy = Boolean(savingIds[e.id]);
                  const emp = e.employeeId
                    ? employees.find((x) => x.id === e.employeeId)
                    : null;
                  const veh = e.vehicleId
                    ? vehicles.find((x) => x.id === e.vehicleId)
                    : null;
                  const cli = e.clientId
                    ? clients.find((x) => x.id === e.clientId)
                    : null;
                  const prj = e.projectId
                    ? projects.find((x) => x.id === e.projectId)
                    : null;
                  const projectOptions = e.clientId
                    ? projects.filter(
                        (p) => !p.clientId || p.clientId === e.clientId,
                      )
                    : projects;
                  return (
                    <tr key={e.id} className={rowBusy ? "row-saving" : undefined}>
                      {canWrite ? (
                        <td className="expenses-col-check">
                          <input
                            type="checkbox"
                            checked={Boolean(selected[e.id])}
                            onChange={() =>
                              setSelected((prev) => ({
                                ...prev,
                                [e.id]: !prev[e.id],
                              }))
                            }
                            aria-label={`בחירת ${e.vendor}`}
                          />
                        </td>
                      ) : null}
                      <td className="expenses-col-date">
                        {formatDate(e.incurredOn)}
                      </td>
                      <td className="expenses-col-vendor" dir="auto">
                        {e.vendor || "—"}
                      </td>
                      <td className="expenses-col-amount">
                        {formatMoney(e.amount, e.currency || "ILS")}
                      </td>
                      <td className="expenses-col-category">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.category}
                            disabled={rowBusy}
                            onChange={(ev) =>
                              patch(e.id, {
                                category: ev.target.value as ExpenseCategory,
                              })
                            }
                          >
                            {CATEGORY_OPTIONS.map((c) => (
                              <option key={c} value={c}>
                                {expenseCategoryLabels[c]}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          expenseCategoryLabels[e.category] ?? e.category
                        )}
                      </td>
                      <td className="expenses-col-status">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.status}
                            disabled={rowBusy}
                            onChange={(ev) =>
                              patch(e.id, {
                                status: ev.target.value as ExpenseStatus,
                              })
                            }
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {expenseStatusLabels[s]}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          <StatusBadge
                            label={expenseStatusLabels[e.status] ?? e.status}
                          />
                        )}
                      </td>
                      <td className="expenses-col-anomaly">
                        {e.anomalyFlag ? (
                          <span
                            className={`status-badge anomaly-badge anomaly-${e.anomalyFlag}`}
                            title={expenseAnomalyLabels[e.anomalyFlag]}
                          >
                            {expenseAnomalyLabels[e.anomalyFlag]}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="expenses-col-docs">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="expenses-docs-btn"
                          disabled={rowBusy}
                          aria-label={`מסמכים · ${e.vendor || e.id}`}
                          onClick={() => setDocsExpense(e)}
                        >
                          <Paperclip size={15} />
                          {e.status === "missing_document" ? (
                            <span className="expenses-docs-warn">חסר</span>
                          ) : null}
                        </Button>
                      </td>
                      <td className="expenses-col-employee">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.employeeId ?? ""}
                            disabled={rowBusy}
                            onChange={(ev) =>
                              patch(e.id, {
                                employeeId: ev.target.value || null,
                              })
                            }
                          >
                            <option value="">—</option>
                            {employees.map((empOpt) => (
                              <option key={empOpt.id} value={empOpt.id}>
                                {empOpt.fullName}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          emp?.fullName ?? "—"
                        )}
                      </td>
                      <td className="expenses-col-vehicle">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.vehicleId ?? ""}
                            disabled={rowBusy}
                            onChange={(ev) =>
                              patch(e.id, {
                                vehicleId: ev.target.value || null,
                              })
                            }
                          >
                            <option value="">—</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.plate}
                                {v.make || v.model
                                  ? ` · ${[v.make, v.model].filter(Boolean).join(" ")}`
                                  : ""}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          veh?.plate ?? "—"
                        )}
                      </td>
                      <td className="expenses-col-client">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.clientId ?? ""}
                            disabled={rowBusy}
                            onChange={(ev) => {
                              const clientId = ev.target.value || null;
                              const next: FieldPatch = { clientId };
                              if (
                                clientId &&
                                e.projectId &&
                                !projects.some(
                                  (p) =>
                                    p.id === e.projectId &&
                                    (!p.clientId || p.clientId === clientId),
                                )
                              ) {
                                next.projectId = null;
                              }
                              patch(e.id, next);
                            }}
                          >
                            <option value="">—</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          cli?.name ?? "—"
                        )}
                      </td>
                      <td className="expenses-col-project">
                        {canWrite ? (
                          <NativeSelect
                            size="sm"
                            className="expenses-row-select"
                            value={e.projectId ?? ""}
                            disabled={rowBusy}
                            onChange={(ev) =>
                              patch(e.id, {
                                projectId: ev.target.value || null,
                              })
                            }
                          >
                            <option value="">—</option>
                            {projectOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </NativeSelect>
                        ) : (
                          prj?.name ?? "—"
                        )}
                      </td>
                      <td className="expenses-col-source" dir="auto">
                        {e.source || "—"}
                      </td>
                      <td className="expenses-col-desc">
                        <span
                          className="expenses-desc-text"
                          dir="auto"
                          title={e.description || undefined}
                        >
                          {e.description || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ExpenseDocumentsDialog
        expense={docsExpense}
        open={Boolean(docsExpense)}
        onOpenChange={(open) => {
          if (!open) setDocsExpense(null);
        }}
        canWrite={canWrite}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title={`לעדכן סטטוס ל־${selectedIds.length} הוצאות?`}
        description={`הסטטוס של כל השורות שנבחרו ישתנה ל״${expenseStatusLabels[bulkStatus]}״.`}
        confirmLabel="עדכון"
        tone="primary"
        onConfirm={async () => {
          const ids = [...selectedIds];
          setBulkConfirmOpen(false);
          applyBulkStatus(ids);
        }}
      />
    </div>
  );
}
