"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { System, SystemCategory } from "@/lib/data/types";
import { systemCategoryLabels } from "@/lib/labels";
import { SystemsGrid } from "@/components/home/systems-section";

const ALL = "all";

export function SystemsBrowser({ systems }: { systems: System[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return systems.filter((system) => {
      const matchesCategory =
        category === ALL || system.category === (category as SystemCategory);
      const matchesQuery =
        !q ||
        [system.name, system.description, systemCategoryLabels[system.category]]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [systems, query, category]);

  return (
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
        <SystemsGrid systems={filtered} />
      ) : (
        <div className="empty-state">
          <h3>לא נמצאו מערכות</h3>
          <p>נסו לשנות את החיפוש או את קטגוריית הסינון.</p>
        </div>
      )}
    </section>
  );
}
