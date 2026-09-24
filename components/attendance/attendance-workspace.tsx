"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { syncAttendanceFromTimewatchAction } from "@/app/(dashboard)/attendance/actions";
import type {
  AttendanceDisplayRow,
  WeeklyAttendanceSummary,
} from "@/lib/attendance/exceptions";
import { attendanceExceptionLabels } from "@/lib/attendance/exceptions";
import type { Employee } from "@/lib/data/types";
import {
  attendanceStatusLabels,
  formatDate,
} from "@/lib/labels";

function formatClock(value: string | null): string {
  if (!value) return "—";
  const m = value.match(/^(\d{1,2}:\d{2})/);
  return m ? m[1] : value;
}

export function AttendanceWorkspace({
  rows,
  employees,
  weekly,
  canWrite,
  canSync,
}: {
  rows: AttendanceDisplayRow[];
  employees: Employee[];
  weekly: WeeklyAttendanceSummary[];
  canWrite: boolean;
  canSync: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const activeEmployees = useMemo(
    () =>
      employees
        .filter((e) => e.status === "active")
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "he")),
    [employees],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (employeeFilter !== "all" && r.employeeId !== employeeFilter) {
        return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (dateFrom && r.workDate < dateFrom) return false;
      if (dateTo && r.workDate > dateTo) return false;
      return true;
    });
  }, [rows, employeeFilter, statusFilter, dateFrom, dateTo]);

  function sync() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await syncAttendanceFromTimewatchAction();
      if (result.error) {
        setError(result.error);
        return;
      }
      setInfo(`סונכרנו ${result.upserted ?? 0} רשומות מ־TimeWatch`);
      router.refresh();
    });
  }

  return (
    <div className="attendance-layout">
      <div className="expenses-toolbar">
        <NativeSelect
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          aria-label="סינון עובד"
        >
          <option value="all">עובד: הכל</option>
          {activeEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="סינון סטטוס"
        >
          <option value="all">סטטוס: הכל</option>
          {(Object.keys(attendanceStatusLabels) as Array<
            keyof typeof attendanceStatusLabels
          >).map((s) => (
            <option key={s} value={s}>
              {attendanceStatusLabels[s]}
            </option>
          ))}
        </NativeSelect>
        <Input
          type="date"
          className="expenses-toolbar-date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="מתאריך"
        />
        <Input
          type="date"
          className="expenses-toolbar-date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="עד תאריך"
        />
        <span className="expenses-toolbar-count">
          {filtered.length}/{rows.length}
        </span>
        {canSync ? (
          <Button
            type="button"
            size="sm"
            disabled={pending || !canWrite}
            onClick={sync}
          >
            {pending ? "מסנכרן…" : "סנכרן מ-TimeWatch"}
          </Button>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {info ? <p className="adapter-status-message">{info}</p> : null}

      <section className="timewatch-summary attendance-weekly" aria-label="סיכום שבועי">
        <h2>סיכום שבועי למנהל</h2>
        <p className="attendance-weekly-note">
          איחורים וחיסורים ב־7 הימים האחרונים (ימי עבודה א׳–ה׳).
        </p>
        {!weekly.length ? (
          <p>אין עובדים פעילים לסיכום.</p>
        ) : (
          <div className="records-table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  <th>עובד</th>
                  <th>ימי איחור</th>
                  <th>ימי חיסור</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((w) => (
                  <tr key={w.employeeId}>
                    <td dir="auto">{w.employeeName}</td>
                    <td>{w.lateDays}</td>
                    <td>{w.absentDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="timewatch-summary">
        {!filtered.length ? (
          <p>
            {rows.length
              ? "אין רשומות תואמות לסינון."
              : "אין רשומות נוכחות עדיין. מנהל יכול לסנכרן מ־TimeWatch."}
          </p>
        ) : (
          <div className="records-table-wrap expenses-table-wrap">
            <table className="records-table expenses-table attendance-table">
              <thead>
                <tr>
                  <th>עובד</th>
                  <th>תאריך</th>
                  <th>כניסה</th>
                  <th>יציאה</th>
                  <th>סטטוס</th>
                  <th>חריגות</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.key} className={r.synthetic ? "row-absent" : undefined}>
                    <td dir="auto">{r.employeeName}</td>
                    <td>{formatDate(r.workDate)}</td>
                    <td>{formatClock(r.checkIn)}</td>
                    <td>{formatClock(r.checkOut)}</td>
                    <td>
                      <span
                        className={`status-badge attendance-status status-${r.status}`}
                      >
                        {attendanceStatusLabels[
                          r.status as keyof typeof attendanceStatusLabels
                        ] ?? r.status}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-exceptions">
                        {r.exceptions.length
                          ? r.exceptions.map((ex) => (
                              <span
                                key={ex}
                                className={`status-badge anomaly-badge attendance-ex attendance-ex-${ex}`}
                              >
                                {attendanceExceptionLabels[ex]}
                              </span>
                            ))
                          : "—"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
