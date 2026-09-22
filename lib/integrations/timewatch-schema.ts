export type AttendanceSummary = {
  date: string;
  reported: number;
  absenceReported: number;
  notReported: number;
};

export type TimewatchSnapshot = {
  version: 1;
  source: "timewatch";
  capturedAt: string;
  sourceUpdatedAt: string;
  hoursAccess: "denied" | "unknown";
  days: AttendanceSummary[];
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

export function parseTimewatchSnapshot(input: unknown): TimewatchSnapshot {
  if (!input || typeof input !== "object") throw new Error("Invalid snapshot");
  const value = input as Record<string, unknown>;
  if (value.version !== 1 || value.source !== "timewatch"
    || !Array.isArray(value.days) || !value.days.length || value.days.length > 366
    || !["denied", "unknown"].includes(String(value.hoursAccess))) {
    throw new Error("Invalid snapshot format");
  }
  for (const field of ["capturedAt", "sourceUpdatedAt"]) {
    if (typeof value[field] !== "string"
      || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value[field] as string)
      || Number.isNaN(Date.parse(value[field] as string))) throw new Error("Invalid timestamp");
  }
  const dates = new Set<string>();
  const days = value.days.map((item: unknown): AttendanceSummary => {
    if (!item || typeof item !== "object") throw new Error("Invalid day");
    const day = item as Record<string, unknown>;
    if (!validDate(day.date) || dates.has(day.date)) throw new Error("Invalid or duplicate date");
    dates.add(day.date);
    for (const field of ["reported", "absenceReported", "notReported"]) {
      if (!Number.isSafeInteger(day[field]) || (day[field] as number) < 0) throw new Error("Invalid count");
    }
    return { date: day.date, reported: day.reported as number,
      absenceReported: day.absenceReported as number, notReported: day.notReported as number };
  }).sort((a, b) => a.date.localeCompare(b.date));
  return { version: 1, source: "timewatch", capturedAt: value.capturedAt as string,
    sourceUpdatedAt: value.sourceUpdatedAt as string,
    hoursAccess: value.hoursAccess as TimewatchSnapshot["hoursAccess"], days };
}

export function localSnapshotsEnabled(env: Record<string, string | undefined>) {
  return env.NODE_ENV === "development" && env.LOCAL_SOURCE_SNAPSHOTS === "1";
}
