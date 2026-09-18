import { getDataStore } from "@/lib/data";
import {
  employeeStatusLabels,
  formatDate,
  navLabels,
  pageDescriptions,
} from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";

export default async function EmployeesPage() {
  const store = getDataStore();
  const [employees, vehicles, assignments] = await Promise.all([
    store.getEmployees(),
    store.getVehicles(),
    store.getVehicleAssignments(),
  ]);

  const currentByEmployee = new Map(
    assignments
      .filter((a) => a.endedAt === null)
      .map((a) => [a.employeeId, a.vehicleId]),
  );
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <PageShell section={navLabels.employees}>
      <PageHeading
        title={navLabels.employees}
        description={pageDescriptions.employees}
      />
      {employees.length ? (
        <RecordsTable
          rows={employees}
          columns={[
            {
              key: "name",
              header: "שם עובד",
              className: "record-name",
              cell: (e) => e.fullName,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (e) => `${e.role} · ${e.email}`,
            },
            {
              key: "vehicle",
              header: "רכב משויך",
              cell: (e) => {
                const vehicleId = currentByEmployee.get(e.id);
                const vehicle = vehicleId ? vehicleById.get(vehicleId) : null;
                return vehicle
                  ? `${vehicle.make} ${vehicle.model} · ${vehicle.plate}`
                  : "ללא שיוך";
              },
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (e) => (
                <StatusBadge label={employeeStatusLabels[e.status]} />
              ),
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (e) => formatDate(e.leaveUntil),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין עובדים"
          description="כשיוגדר מקור נתונים, יופיעו כאן רשומות העובדים."
        />
      )}
    </PageShell>
  );
}
