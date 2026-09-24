"use client";

import { Input } from "@/components/ui/input";
import { CrudPanel, RowActions } from "@/components/records/crud-panel";
import {
  EmptyState,
  RecordsTable,
} from "@/components/records/records-table";
import {
  deleteClientAction,
  saveClientAction,
} from "@/app/(dashboard)/actions";
import type { Client } from "@/lib/data/types";

export function ClientsCrud({
  rows,
  canWrite,
}: {
  rows: Client[];
  canWrite: boolean;
}) {
  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת לקוח"
      rows={rows}
      emptyDraft={() =>
        ({
          id: "",
          name: "",
          phone: "",
          email: "",
          createdAt: "",
          updatedAt: "",
        }) satisfies Client
      }
      onSave={async (draft) => {
        await saveClientAction(draft.id || null, {
          name: draft.name.trim(),
          phone: draft.phone.trim(),
          email: draft.email.trim(),
        });
      }}
      onDelete={async (id) => {
        await deleteClientAction(id);
      }}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              שם לקוח
              <Input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
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
              אימייל
              <Input
                type="email"
                dir="ltr"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
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
                header: "שם",
                className: "record-name",
                cell: (c) => c.name,
              },
              {
                key: "phone",
                header: "טלפון",
                cell: (c) => c.phone || "—",
              },
              {
                key: "email",
                header: "אימייל",
                cell: (c) => c.email || "—",
              },
              {
                key: "actions",
                header: "",
                cell: (c) => (
                  <RowActions
                    canWrite={write}
                    label={c.name}
                    onEdit={() => onEdit(c)}
                    onDelete={() => onDelete(c)}
                  />
                ),
              },
            ]}
          />
        ) : (
          <EmptyState
            title="אין לקוחות"
            description="הוסיפו לקוח ראשון כדי לשייך רכבים, הוצאות וחשבוניות."
          />
        )
      }
    </CrudPanel>
  );
}
