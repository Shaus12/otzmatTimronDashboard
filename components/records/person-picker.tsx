"use client";

import { NativeSelect } from "@/components/ui/native-select";
import type { ProfileOption } from "@/lib/data/types";

/** Shared assignee select used by tasks and legal cases. */
export function PersonPicker({
  value,
  onChange,
  people,
  emptyLabel = "—",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  people: ProfileOption[];
  emptyLabel?: string;
}) {
  return (
    <NativeSelect
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">{emptyLabel}</option>
      {people.map((p) => (
        <option key={p.id} value={p.id}>
          {p.fullName}
        </option>
      ))}
    </NativeSelect>
  );
}
