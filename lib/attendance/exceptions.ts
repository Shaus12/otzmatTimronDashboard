import type { AttendanceRecord, Employee } from "@/lib/data/types";

/** Fixed default start — not configurable yet. */
export const DEFAULT_START_TIME = "09:00";
export const LATE_GRACE_MINUTES = 15;

/** Informational exception badges (same spirit as expense anomaly_flag). */
export type AttendanceException = "late" | "absent";

export const attendanceExceptionLabels: Record<AttendanceException, string> = {
  late: "איחור",
  absent: "חיסור",
};

function parseHmToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

const DEFAULT_START_MINUTES = parseHmToMinutes(DEFAULT_START_TIME) ?? 9 * 60;

/** Israel work week: Sunday–Thursday. */
export function isWorkday(dateIso: string): boolean {
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return false;
  const day = date.getDay(); // 0=Sun … 6=Sat
  return day >= 0 && day <= 4;
}

function localDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysIso(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localDateIso(date);
}

/** check_in more than LATE_GRACE_MINUTES after DEFAULT_START_TIME. */
export function isLateCheckIn(checkIn: string | null | undefined): boolean {
  const mins = parseHmToMinutes(checkIn);
  if (mins == null) return false;
  return mins > DEFAULT_START_MINUTES + LATE_GRACE_MINUTES;
}

/**
 * Days (weekdays) where at least one attendance row exists — evidence the sync
 * covered that day. Missing employees on those days are real absences.
 */
export function syncedWorkDates(records: AttendanceRecord[]): Set<string> {
  const dates = new Set<string>();
  for (const r of records) {
    const day = r.workDate.slice(0, 10);
    if (isWorkday(day)) dates.add(day);
  }
  return dates;
}

export function isAbsentOnDay(
  employeeId: string,
  workDate: string,
  records: AttendanceRecord[],
  syncedDates: Set<string>,
): boolean {
  const day = workDate.slice(0, 10);
  if (!isWorkday(day) || !syncedDates.has(day)) return false;
  return !records.some(
    (r) => r.employeeId === employeeId && r.workDate.slice(0, 10) === day,
  );
}

export function exceptionsForRecord(
  record: AttendanceRecord,
): AttendanceException[] {
  const out: AttendanceException[] = [];
  if (record.status === "late" || isLateCheckIn(record.checkIn)) {
    out.push("late");
  }
  if (record.status === "absent") {
    out.push("absent");
  }
  return out;
}

export type AttendanceDisplayRow = {
  key: string;
  employeeId: string;
  employeeName: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceRecord["status"] | "absent";
  source: string | null;
  exceptions: AttendanceException[];
  /** True when row is a derived absence (no DB record). */
  synthetic: boolean;
};

/**
 * Build table rows: stored records + synthetic absences for active employees
 * on synced weekdays where they have no record.
 */
export function buildAttendanceDisplayRows(
  records: AttendanceRecord[],
  employees: Employee[],
): AttendanceDisplayRow[] {
  const byId = new Map(employees.map((e) => [e.id, e]));
  const synced = syncedWorkDates(records);
  const rows: AttendanceDisplayRow[] = [];

  for (const r of records) {
    const emp = byId.get(r.employeeId);
    rows.push({
      key: r.id,
      employeeId: r.employeeId,
      employeeName: emp?.fullName ?? "—",
      workDate: r.workDate.slice(0, 10),
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status,
      source: r.source,
      exceptions: exceptionsForRecord(r),
      synthetic: false,
    });
  }

  const active = employees.filter((e) => e.status === "active");
  for (const day of synced) {
    for (const emp of active) {
      if (isAbsentOnDay(emp.id, day, records, synced)) {
        rows.push({
          key: `absent:${emp.id}:${day}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          workDate: day,
          checkIn: null,
          checkOut: null,
          status: "absent",
          source: null,
          exceptions: ["absent"],
          synthetic: true,
        });
      }
    }
  }

  rows.sort((a, b) => {
    const d = b.workDate.localeCompare(a.workDate);
    if (d !== 0) return d;
    return a.employeeName.localeCompare(b.employeeName, "he");
  });
  return rows;
}

export type WeeklyAttendanceSummary = {
  employeeId: string;
  employeeName: string;
  lateDays: number;
  absentDays: number;
};

/** Per-employee late/absent counts for the last 7 calendar days. */
export function buildWeeklyAttendanceSummary(
  records: AttendanceRecord[],
  employees: Employee[],
  todayIso = localDateIso(new Date()),
): WeeklyAttendanceSummary[] {
  const endIso = todayIso.slice(0, 10);
  const startIso = addDaysIso(endIso, -6);

  const inWindow = (day: string) => day >= startIso && day <= endIso;

  const windowRecords = records.filter((r) =>
    inWindow(r.workDate.slice(0, 10)),
  );
  const synced = syncedWorkDates(windowRecords);
  const active = employees.filter((e) => e.status === "active");

  return active
    .map((emp) => {
      let lateDays = 0;
      let absentDays = 0;
      for (let offset = 0; offset <= 6; offset++) {
        const day = addDaysIso(startIso, offset);
        if (!isWorkday(day)) continue;
        const rec = windowRecords.find(
          (r) =>
            r.employeeId === emp.id && r.workDate.slice(0, 10) === day,
        );
        if (rec) {
          if (rec.status === "late" || isLateCheckIn(rec.checkIn)) {
            lateDays += 1;
          }
        } else if (isAbsentOnDay(emp.id, day, windowRecords, synced)) {
          absentDays += 1;
        }
      }
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        lateDays,
        absentDays,
      };
    })
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName, "he"));
}
