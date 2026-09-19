"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CrudPanel, RowActions } from "@/components/records/crud-panel";
import { PersonPicker } from "@/components/records/person-picker";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";
import { deleteTaskAction, saveTaskAction } from "@/app/(dashboard)/actions";
import type { Employee, Task, TaskStatus } from "@/lib/data/types";
import { formatDate, taskStatusLabels } from "@/lib/labels";

type Row = Task & { assigneeName: string };

export function TasksCrud({
  rows,
  employees,
  canWrite,
}: {
  rows: Row[];
  employees: Employee[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת משימה"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          title: "",
          description: "",
          status: "open" as TaskStatus,
          dueDate: null,
          assignedTo: null,
          createdAt: "",
          updatedAt: "",
          assigneeName: "—",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveTaskAction(draft.id || null, {
          title: draft.title,
          description: draft.description,
          status: draft.status,
          dueDate: draft.dueDate,
          assignedTo: draft.assignedTo,
        });
      }}
      onDelete={async (id) => deleteTaskAction(id)}
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
                סטטוס
                <NativeSelect
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as TaskStatus,
                    })
                  }
                >
                  {(Object.keys(taskStatusLabels) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {taskStatusLabels[s]}
                    </option>
                  ))}
                </NativeSelect>
              </label>
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
            </div>
            <label>
              אחראי
              <PersonPicker
                value={draft.assignedTo}
                onChange={(assignedTo) => setDraft({ ...draft, assignedTo })}
                people={employees.map((e) => ({
                  id: e.id,
                  fullName: e.fullName,
                }))}
              />
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
                cell: (t) => t.title,
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (t) => t.description,
              },
              {
                key: "assignee",
                header: "אחראי / איש קשר",
                cell: (t) => t.assigneeName,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (t) => (
                  <StatusBadge label={taskStatusLabels[t.status]} />
                ),
              },
              {
                key: "due",
                header: "מועד למעקב",
                className: "date-cell",
                cell: (t) => formatDate(t.dueDate),
              },
              {
                key: "actions",
                header: "",
                cell: (t) => (
                  <RowActions
                    canWrite={write}
                    label={t.title}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין משימות"
            description="הוסיפו משימה ראשונה או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
