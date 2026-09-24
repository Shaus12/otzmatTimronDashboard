"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getServiceDataStore } from "@/lib/data";
import { timewatchAdapter } from "@/lib/adapters/sources/timewatch";
import { toUserFacingError } from "@/lib/errors";
import type { AttendanceRecordInput } from "@/lib/data/store";

/**
 * Admin-only: pull mock TimeWatch attendance for active employees and upsert
 * into attendance_records (conflict on employee_id + work_date).
 */
export async function syncAttendanceFromTimewatchAction(): Promise<{
  upserted?: number;
  error?: string;
}> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") {
      return { error: "רק מנהל יכול לסנכרן מ־TimeWatch" };
    }
    if (!canWrite(profile.role, "attendance")) {
      return { error: "אין הרשאה לעריכת נוכחות" };
    }

    const store = await getServiceDataStore();
    const employees = (await store.getEmployees()).filter(
      (e) => e.status === "active",
    );
    if (!employees.length) {
      return { error: "אין עובדים פעילים לסנכרון" };
    }

    const rows = await timewatchAdapter.fetchData({
      employees: employees.map((e) => ({ id: e.id, fullName: e.fullName })),
    });

    const inputs: AttendanceRecordInput[] = rows
      .filter((r) => r.employeeId)
      .map((r) => ({
        employeeId: r.employeeId!,
        workDate: r.date.slice(0, 10),
        checkIn: r.clockIn || null,
        checkOut: r.clockOut || null,
        status: r.status,
        source: "timewatch",
      }));

    const upserted = await store.upsertAttendanceRecords(inputs);
    revalidatePath("/attendance");
    revalidatePath("/systems/timewatch");
    return { upserted: upserted.length };
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}
