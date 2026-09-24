import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import {
  buildAttendanceDisplayRows,
  buildWeeklyAttendanceSummary,
} from "@/lib/attendance/exceptions";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { AttendanceWorkspace } from "@/components/attendance/attendance-workspace";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [records, employees] = await Promise.all([
    store.getAttendanceRecords(),
    store.getEmployees(),
  ]);

  const rows = buildAttendanceDisplayRows(records, employees);
  const weekly = buildWeeklyAttendanceSummary(records, employees);
  const canEdit = canWrite(profile?.role, "attendance");
  const canSync = profile?.role === "admin";

  return (
    <PageShell section={navLabels.attendance}>
      <PageHeading
        title={navLabels.attendance}
        description={pageDescriptions.attendance}
      />
      <AttendanceWorkspace
        rows={rows}
        employees={employees}
        weekly={weekly}
        canWrite={canEdit}
        canSync={canSync}
      />
    </PageShell>
  );
}
