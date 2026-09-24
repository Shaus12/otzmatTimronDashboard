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
import {
  deleteVehicleAction,
  saveVehicleAction,
} from "@/app/(dashboard)/actions";
import type {
  Client,
  Employee,
  Vehicle,
  VehicleStatus,
} from "@/lib/data/types";
import { vehicleStatusLabels } from "@/lib/labels";

type Row = Vehicle & {
  assigneeEmployeeId: string;
  assigneeClientId: string;
  assigneeName: string;
};

export function VehiclesCrud({
  rows,
  employees,
  clients,
  canWrite,
}: {
  rows: Row[];
  employees: Employee[];
  clients: Client[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת רכב"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          plate: "",
          make: "",
          model: "",
          year: new Date().getFullYear(),
          notes: "",
          status: "active" as VehicleStatus,
          clientId: null,
          createdAt: "",
          updatedAt: "",
          assigneeEmployeeId: "",
          assigneeClientId: "",
          assigneeName: "ללא שיוך",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveVehicleAction(
          draft.id || null,
          {
            plate: draft.plate,
            make: draft.make,
            model: draft.model,
            year: Number(draft.year),
            notes: draft.notes,
            status: draft.status,
            clientId: null,
          },
          draft.assigneeEmployeeId || null,
          draft.assigneeClientId || null,
        );
      }}
      onDelete={async (id) => {
        await deleteVehicleAction(id);
      }}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <div className="form-grid">
              <label>
                יצרן
                <Input
                  required
                  value={draft.make}
                  onChange={(e) => setDraft({ ...draft, make: e.target.value })}
                />
              </label>
              <label>
                דגם
                <Input
                  required
                  value={draft.model}
                  onChange={(e) =>
                    setDraft({ ...draft, model: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="form-grid">
              <label>
                מספר רישוי
                <Input
                  required
                  dir="ltr"
                  value={draft.plate}
                  onChange={(e) =>
                    setDraft({ ...draft, plate: e.target.value })
                  }
                />
              </label>
              <label>
                שנה
                <Input
                  type="number"
                  required
                  value={draft.year}
                  onChange={(e) =>
                    setDraft({ ...draft, year: Number(e.target.value) })
                  }
                />
              </label>
            </div>
            <label>
              הערות
              <Textarea
                rows={3}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>
            <label>
              סטטוס
              <NativeSelect
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as VehicleStatus,
                  })
                }
              >
                {(Object.keys(vehicleStatusLabels) as VehicleStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {vehicleStatusLabels[s]}
                    </option>
                  ),
                )}
              </NativeSelect>
            </label>
            <label>
              שיוך לעובד
              <NativeSelect
                value={draft.assigneeEmployeeId}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    assigneeEmployeeId: e.target.value,
                    assigneeClientId: e.target.value
                      ? ""
                      : draft.assigneeClientId,
                  })
                }
              >
                <option value="">ללא שיוך</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label>
              שיוך ללקוח
              <NativeSelect
                value={draft.assigneeClientId}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    assigneeClientId: e.target.value,
                    assigneeEmployeeId: e.target.value
                      ? ""
                      : draft.assigneeEmployeeId,
                  })
                }
              >
                <option value="">ללא שיוך</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
              <small className="field-help">
                ניתן לשייך לעובד או ללקוח — לא לשניהם יחד. שינוי שיוך עובד סוגר
                את ההיסטוריה הקודמת ופותח רשומה חדשה.
              </small>
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
                header: "רכב / מספר רישוי",
                className: "record-name",
                cell: (v) => `${v.make} ${v.model} · ${v.plate}`,
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (v) =>
                  [v.year || null, v.notes].filter(Boolean).join(" · ") || "—",
              },
              {
                key: "assignee",
                header: "משויך ל",
                cell: (v) => v.assigneeName,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (v) => (
                  <StatusBadge label={vehicleStatusLabels[v.status]} />
                ),
              },
              {
                key: "actions",
                header: "",
                cell: (v) => (
                  <RowActions
                    canWrite={write}
                    label={`${v.make} ${v.model}`}
                    onEdit={() => onEdit(v)}
                    onDelete={() => onDelete(v)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין רכבים"
            description="הוסיפו רכב ראשון או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
