"use client";

import Link from "next/link";
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
import { deleteLegalAction, saveLegalAction } from "@/app/(dashboard)/actions";
import type { LegalCase, LegalStatus, ProfileOption } from "@/lib/data/types";
import { formatDate, legalStatusLabels } from "@/lib/labels";

type Row = LegalCase & { assigneeName: string };

export function LegalCrud({
  rows,
  profiles,
  canWrite,
}: {
  rows: Row[];
  profiles: ProfileOption[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת תיק"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          title: "",
          description: "",
          caseNumber: "",
          status: "open" as LegalStatus,
          dueDate: null,
          assignedTo: null,
          createdAt: "",
          updatedAt: "",
          assigneeName: "—",
        }) satisfies Row
      }
      onSave={async (draft) => {
        await saveLegalAction(draft.id || null, {
          title: draft.title,
          description: draft.description,
          caseNumber: draft.caseNumber,
          status: draft.status,
          dueDate: draft.dueDate,
          assignedTo: draft.assignedTo,
        });
      }}
      onDelete={async (id) => deleteLegalAction(id)}
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
              מספר תיק
              <Input
                required
                dir="ltr"
                value={draft.caseNumber}
                onChange={(e) =>
                  setDraft({ ...draft, caseNumber: e.target.value })
                }
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
                      status: e.target.value as LegalStatus,
                    })
                  }
                >
                  {(Object.keys(legalStatusLabels) as LegalStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {legalStatusLabels[s]}
                      </option>
                    ),
                  )}
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
                people={profiles}
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
                cell: (c) => (
                  <Link href={`/legal/${c.id}`} className="text-button">
                    {c.title} · {c.caseNumber}
                  </Link>
                ),
              },
              {
                key: "detail",
                header: "פרטים",
                className: "record-detail",
                cell: (c) => c.description,
              },
              {
                key: "assignee",
                header: "אחראי",
                cell: (c) => c.assigneeName,
              },
              {
                key: "status",
                header: "סטטוס",
                cell: (c) => (
                  <StatusBadge label={legalStatusLabels[c.status]} />
                ),
              },
              {
                key: "due",
                header: "מועד למעקב",
                className: "date-cell",
                cell: (c) => formatDate(c.dueDate),
              },
              {
                key: "actions",
                header: "",
                cell: (c) => (
                  <RowActions
                    canWrite={write}
                    label={c.title}
                    onEdit={() => onEdit(c)}
                    onDelete={() => onDelete(c)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין תיקים"
            description="הוסיפו תיק ראשון או המתינו לסנכרון נתונים."
          />
        )
      }
    </CrudPanel>
  );
}
