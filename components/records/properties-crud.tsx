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
  deletePropertyAction,
  savePropertyAction,
} from "@/app/(dashboard)/actions";
import type { Property, PropertyStatus } from "@/lib/data/types";
import { propertyStatusLabels } from "@/lib/labels";

export function PropertiesCrud({
  rows,
  canWrite,
}: {
  rows: Property[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת נכס"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          name: "",
          address: "",
          details: "",
          status: "active" as PropertyStatus,
          contactName: "",
          createdAt: "",
          updatedAt: "",
        }) satisfies Property
      }
      onSave={async (draft) => {
        await savePropertyAction(draft.id || null, {
          name: draft.name,
          address: draft.address,
          details: draft.details,
          status: draft.status,
          contactName: draft.contactName,
        });
      }}
      onDelete={async (id) => deletePropertyAction(id)}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              שם
              <Input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              כתובת
              <Input
                required
                value={draft.address}
                onChange={(e) =>
                  setDraft({ ...draft, address: e.target.value })
                }
              />
            </label>
            <label>
              פרטים
              <Textarea
                rows={3}
                value={draft.details}
                onChange={(e) =>
                  setDraft({ ...draft, details: e.target.value })
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
                      status: e.target.value as PropertyStatus,
                    })
                  }
                >
                  {(Object.keys(propertyStatusLabels) as PropertyStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {propertyStatusLabels[s]}
                      </option>
                    ),
                  )}
                </NativeSelect>
              </label>
              <label>
                איש קשר
                <Input
                  value={draft.contactName}
                  onChange={(e) =>
                    setDraft({ ...draft, contactName: e.target.value })
                  }
                />
              </label>
            </div>
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
                cell: (p) => p.name,
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (p) =>
                  [p.address, p.details].filter(Boolean).join(" · ") || "—",
              },
              {
                key: "assignee",
                header: "איש קשר",
                cell: (p) => p.contactName || "—",
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (p) => (
                  <StatusBadge label={propertyStatusLabels[p.status]} />
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
            title="אין נכסים"
            description="הוסיפו נכס ראשון או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
