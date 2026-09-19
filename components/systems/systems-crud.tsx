"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudPanel, RowActions } from "@/components/records/crud-panel";
import { SystemsGrid } from "@/components/home/systems-section";
import {
  deleteSystemAction,
  saveSystemAction,
} from "@/app/(dashboard)/actions";
import type { System, SystemCategory } from "@/lib/data/types";
import { systemCategoryLabels } from "@/lib/labels";

const ALL = "all";

export function SystemsCrud({
  systems,
  canWrite,
}: {
  systems: System[];
  canWrite: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return systems.filter((system) => {
      const matchesCategory =
        category === ALL || system.category === (category as SystemCategory);
      const matchesQuery =
        !q ||
        [
          system.name,
          system.description,
          systemCategoryLabels[system.category],
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [systems, query, category]);

  return (
    <CrudPanel
      canWrite={canWrite}
      addLabel="הוספת מערכת"
      rows={systems}
      emptyDraft={() =>
        ({
          id: "",
          name: "",
          description: "",
          category: "finance" as SystemCategory,
          url: null,
          createdAt: "",
          updatedAt: "",
        }) satisfies System
      }
      onSave={async (draft) => {
        await saveSystemAction(draft.id || null, {
          name: draft.name,
          description: draft.description,
          category: draft.category,
          url: draft.url,
        });
      }}
      onDelete={async (id) => deleteSystemAction(id)}
      renderForm={({ draft, setDraft }) =>
        draft ? (
          <>
            <label>
              שם מערכת
              <Input
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              תיאור
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <label>
              תחום
              <NativeSelect
                value={draft.category}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: e.target.value as SystemCategory,
                  })
                }
              >
                {(Object.keys(systemCategoryLabels) as SystemCategory[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {systemCategoryLabels[c]}
                    </option>
                  ),
                )}
              </NativeSelect>
            </label>
            <label>
              קישור (https)
              <Input
                type="url"
                dir="ltr"
                placeholder="https://"
                value={draft.url ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, url: e.target.value || null })
                }
              />
            </label>
          </>
        ) : null
      }
    >
      {({ onEdit, onDelete, canWrite: write }) => (
        <section className="records-section">
          <div className="toolbar">
            <label className="search-box">
              <Search size={19} />
              <Input
                aria-label="חיפוש מערכת"
                placeholder="חיפוש מערכת…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <span className="results-count">{filtered.length} מערכות</span>
          </div>

          <Tabs dir="rtl" value={category} onValueChange={setCategory}>
            <TabsList variant="line" className="category-tabs">
              <TabsTrigger value={ALL}>הכול</TabsTrigger>
              {(Object.keys(systemCategoryLabels) as SystemCategory[]).map(
                (key) => (
                  <TabsTrigger key={key} value={key}>
                    {systemCategoryLabels[key]}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </Tabs>

          {filtered.length ? (
            <div className="systems-manage">
              <SystemsGrid systems={filtered} />
              {write ? (
                <div className="systems-edit-list">
                  {filtered.map((system) => (
                    <div key={system.id} className="systems-edit-row">
                      <span>{system.name}</span>
                      <RowActions
                        canWrite={write}
                        label={system.name}
                        onEdit={() => onEdit(system)}
                        onDelete={() => onDelete(system)}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">
              <h3>לא נמצאו מערכות</h3>
              <p>נסו לשנות את החיפוש או את קטגוריית הסינון.</p>
            </div>
          )}
        </section>
      )}
    </CrudPanel>
  );
}
