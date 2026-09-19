"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CrudPanel, RowActions } from "@/components/records/crud-panel";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";
import { deleteFineAction, saveFineAction } from "@/app/(dashboard)/actions";
import type { Employee, Fine, FineStatus, Vehicle } from "@/lib/data/types";
import { fineStatusLabels, formatDate, formatIls } from "@/lib/labels";

type Row = Fine & { assigneeName: string; detailLine: string };

export function FinesCrud({
  rows,
  employees,
  vehicles,
  canWrite,
}: {
  rows: Row[];
  employees: Employee[];
  vehicles: Vehicle[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת קנס"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          title: "",
          description: "",
          amount: 0,
          status: "open" as FineStatus,
          dueDate: null,
          vehicleId: null,
          employeeId: null,
          createdAt: "",
          updatedAt: "",
          assigneeName: "—",
          detailLine: "",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveFineAction(draft.id || null, {
          title: draft.title,
          description: draft.description,
          amount: Number(draft.amount),
          status: draft.status,
          dueDate: draft.dueDate,
          vehicleId: draft.vehicleId,
          employeeId: draft.employeeId,
        });
      }}
      onDelete={async (id) => deleteFineAction(id)}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              נושא
              <Input
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              פרטים
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                סכום (₪)
                <Input
                  type="number"
                  required
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                סטטוס
                <NativeSelect
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as FineStatus,
                    })
                  }
                >
                  {(Object.keys(fineStatusLabels) as FineStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {fineStatusLabels[s]}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </div>
            <div className="form-grid">
              <label>
                מועד
                <Input
                  type="date"
                  value={draft.dueDate ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, dueDate: e.target.value || null })
                  }
                />
              </label>
              <label>
                רכב
                <NativeSelect
                  value={draft.vehicleId ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      vehicleId: e.target.value || null,
                    })
                  }
                >
                  <option value="">—</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </div>
            <label>
              אחראי
              <NativeSelect
                value={draft.employeeId ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    employeeId: e.target.value || null,
                  })
                }
              >
                <option value="">—</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </NativeSelect>
            </label>
          </>
        ) : null
      }
    >
      {({ onEdit, onDelete, canWrite: write }) =>
        rows.length ? (
          <RecordsTable
            rows={rows}
            columns={[
              {
                key: "name",
                header: "שם / נושא",
                className: "record-name",
                cell: (f) => f.title,
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (f) => `${f.detailLine} · ${formatIls(f.amount)}`,
              },
              {
                key: "assignee",
                header: "אחראי",
                cell: (f) => f.assigneeName,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (f) => (
                  <StatusBadge label={fineStatusLabels[f.status]} />
                ),
              },
              {
                key: "due",
                header: "מועד למעקב",
                className: "date-cell",
                cell: (f) => formatDate(f.dueDate),
              },
              {
                key: "actions",
                header: "",
                cell: (f) => (
                  <RowActions
                    canWrite={write}
                    label={f.title}
                    onEdit={() => onEdit(f)}
                    onDelete={() => onDelete(f)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין קנסות"
            description="הוסיפו קנס ראשון או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
