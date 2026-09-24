"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { CrudPanel, RowActions } from "@/components/records/crud-panel";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";
import {
  deleteProjectAction,
  saveProjectAction,
} from "@/app/(dashboard)/actions";
import type { Client, Project, ProjectStatus } from "@/lib/data/types";
import { projectStatusLabels } from "@/lib/labels";

type Row = Project & { clientName: string };

export function ProjectsCrud({
  rows,
  clients,
  canWrite,
}: {
  rows: Row[];
  clients: Client[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת פרויקט"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          name: "",
          status: "active" as ProjectStatus,
          clientId: null,
          clientName: "ללא לקוח",
          createdAt: "",
          updatedAt: "",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveProjectAction(draft.id || null, {
          name: draft.name.trim(),
          status: draft.status,
          clientId: draft.clientId || null,
        });
      }}
      onDelete={async (id) => {
        await deleteProjectAction(id);
      }}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              שם פרויקט
              <Input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              לקוח
              <NativeSelect
                value={draft.clientId ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, clientId: e.target.value || null })
                }
              >
                <option value="">ללא לקוח</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label>
              סטטוס
              <NativeSelect
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as ProjectStatus,
                  })
                }
              >
                {(Object.keys(projectStatusLabels) as ProjectStatus[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {projectStatusLabels[s]}
                    </option>
                  ),
                )}
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
                header: "שם",
                className: "record-name",
                cell: (p) => p.name,
              },
              {
                key: "client",
                header: "לקוח",
                cell: (p) => p.clientName,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (p) => (
                  <StatusBadge
                    label={projectStatusLabels[p.status] ?? p.status}
                  />
                ),
              },
              {
                key: "actions",
                header: "",
                cell: (p) => (
                  <RowActions
                    canWrite={write}
                    label={p.name}
                    onEdit={() => onEdit(p)}
                    onDelete={() => onDelete(p)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין פרויקטים"
            description="הוסיפו פרויקט ראשון ושיוך ללקוח."
          />
        )
      }
    </CrudPanel>
  );
}
