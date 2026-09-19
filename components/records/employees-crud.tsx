"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  CrudPanel,
  RowActions,
} from "@/components/records/crud-panel";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";
import {
  deleteEmployeeAction,
  saveEmployeeAction,
} from "@/app/(dashboard)/actions";
import type { Employee, EmployeeStatus } from "@/lib/data/types";
import { employeeStatusLabels } from "@/lib/labels";

type Row = Employee & { assignedVehicle: string };

export function EmployeesCrud({
  rows,
  canWrite,
}: {
  rows: Row[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת עובד"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          fullName: "",
          email: "",
          jobTitle: "",
          phone: "",
          status: "active" as EmployeeStatus,
          createdAt: "",
          updatedAt: "",
          assignedVehicle: "ללא שיוך",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveEmployeeAction(draft.id || null, {
          fullName: draft.fullName,
          email: draft.email,
          jobTitle: draft.jobTitle,
          phone: draft.phone,
          status: draft.status,
        });
      }}
      onDelete={async (id) => {
        await deleteEmployeeAction(id);
      }}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              שם עובד
              <Input
                required
                value={draft.fullName}
                onChange={(e) =>
                  setDraft({ ...draft, fullName: e.target.value })
                }
              />
            </label>
            <label>
              תפקיד
              <Input
                value={draft.jobTitle}
                onChange={(e) =>
                  setDraft({ ...draft, jobTitle: e.target.value })
                }
              />
            </label>
            <label>
              אימייל
              <Input
                type="email"
                dir="ltr"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              טלפון
              <Input
                dir="ltr"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label>
              סטטוס
              <NativeSelect
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as EmployeeStatus,
                  })
                }
              >
                {(Object.keys(employeeStatusLabels) as EmployeeStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {employeeStatusLabels[s]}
                    </option>
                  ),
                )}
              </NativeSelect>
            </label>
            <p className="field-help">שיוך רכב מתבצע ממסך הרכבים.</p>
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
                header: "שם עובד",
                className: "record-name",
                cell: (e) => e.fullName,
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (e) =>
                  [e.jobTitle, e.email].filter(Boolean).join(" · ") || "—",
              },
              {
                key: "vehicle",
                header: "רכב משויך",
                cell: (e) => e.assignedVehicle,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (e) => (
                  <StatusBadge label={employeeStatusLabels[e.status]} />
                ),
              },
              {
                key: "actions",
                header: "",
                cell: (e) => (
                  <RowActions
                    canWrite={write}
                    label={e.fullName}
                    onEdit={() => onEdit(e)}
                    onDelete={() => onDelete(e)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין עובדים"
            description="הוסיפו עובד ראשון או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
