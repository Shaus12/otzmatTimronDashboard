import { createMockAdapter } from "../mock";
import type { AttendanceRow, FetchDataOptions, SourceAdapter } from "../types";
import { readTimewatchSnapshot } from "@/lib/integrations/timewatch-snapshot";
import { isWorkday } from "@/lib/attendance/exceptions";

type EmpRef = { id: string; fullName: string };

/** Fallback roster when fetchData() is called without employees (systems preview). */
const DEMO_EMPLOYEES: EmpRef[] = [
  { id: "emp-demo-01", fullName: "נועם דמו" },
  { id: "emp-demo-02", fullName: "מיה דמו" },
  { id: "emp-demo-03", fullName: "אורן דמו" },
];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function formatHm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hoursBetween(clockIn: string, clockOut: string): number {
  const [ih, im] = clockIn.split(":").map(Number);
  const [oh, om] = clockOut.split(":").map(Number);
  return Math.round(((oh * 60 + om - (ih * 60 + im)) / 60) * 100) / 100;
}

/** Local calendar YYYY-MM-DD (avoids UTC shift from toISOString). */
function localDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateOffsetIso(daysBack: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - daysBack);
  return localDateIso(d);
}

/**
 * Realistic mock attendance for the last 14 calendar days:
 * mostly on-time, some late, a couple of intentional absences (skipped rows)
 * so exception rules can fire when multiple employees exist.
 */
export function generateMockAttendanceRows(
  employees: EmpRef[],
  today = new Date(),
): AttendanceRow[] {
  const roster = employees.filter((e) => e.id && e.fullName);
  if (!roster.length) return [];

  const rows: AttendanceRow[] = [];
  // Deterministic absence slots: first two active employees miss one weekday each.
  const absenceSlots = new Set<string>();
  if (roster.length >= 2) {
    for (let back = 1; back <= 14 && absenceSlots.size < 2; back++) {
      const day = dateOffsetIso(back, today);
      if (!isWorkday(day)) continue;
      const emp = roster[absenceSlots.size % roster.length];
      absenceSlots.add(`${emp.id}|${day}`);
    }
  }

  for (let back = 0; back < 14; back++) {
    const day = dateOffsetIso(back, today);
    if (!isWorkday(day)) continue;

    for (let i = 0; i < roster.length; i++) {
      const emp = roster[i];
      if (absenceSlots.has(`${emp.id}|${day}`)) continue;

      const seed = hashSeed(`${emp.id}:${day}`);
      const bucket = seed % 10;
      // ~20% late arrivals
      const late = bucket >= 8;
      const checkInMins = late
        ? 9 * 60 + 16 + (seed % 35) // 09:16–09:50
        : 8 * 60 + 45 + (seed % 26); // 08:45–09:10
      const checkOutMins = 16 * 60 + 30 + (seed % 60); // 16:30–17:29
      const clockIn = formatHm(checkInMins);
      const clockOut = formatHm(checkOutMins);

      rows.push({
        id: `tw-${emp.id.slice(0, 8)}-${day}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        date: day,
        clockIn,
        clockOut,
        hours: hoursBetween(clockIn, clockOut),
        status: late ? "late" : "present",
      });
    }
  }

  return rows.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    if (d !== 0) return d;
    return a.employeeName.localeCompare(b.employeeName, "he");
  });
}

const mockAdapter = createMockAdapter<AttendanceRow>({
  id: "timewatch",
  name: "TimeWatch",
  category: "hr",
  lastSynced: "2026-09-20T08:05:00.000Z",
  message: "נוכחות מדומה מ־TimeWatch",
  rows: generateMockAttendanceRows(DEMO_EMPLOYEES),
});

export const timewatchAdapter: SourceAdapter<AttendanceRow> = {
  ...mockAdapter,
  async checkStatus() {
    const result = await readTimewatchSnapshot();
    if (result.state === "error") {
      return { state: "error", message: "קובץ הנוכחות המקומי אינו תקין" };
    }
    if (result.snapshot) {
      return {
        state: "imported",
        lastSynced: result.snapshot.capturedAt,
        message:
          "סיכום נוכחות אמיתי שיובא פעם אחת · ללא סנכרון אוטומטי",
      };
    }
    return mockAdapter.checkStatus();
  },
  async fetchData(options?: FetchDataOptions) {
    // Sync path: always mock generation against the provided roster.
    if (options?.employees?.length) {
      return generateMockAttendanceRows(options.employees);
    }
    // Systems preview: prefer local snapshot summary (not per-employee rows).
    const result = await readTimewatchSnapshot();
    if (result.state !== "unavailable") return [];
    return generateMockAttendanceRows(DEMO_EMPLOYEES);
  },
};
