import { getDataStore } from "@/lib/data";
import {
  formatDate,
  navLabels,
  pageDescriptions,
  vehicleStatusLabels,
} from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";

export default async function VehiclesPage() {
  const store = getDataStore();
  const [vehicles, employees, assignments] = await Promise.all([
    store.getVehicles(),
    store.getEmployees(),
    store.getVehicleAssignments(),
  ]);

  const currentByVehicle = new Map(
    assignments
      .filter((a) => a.endedAt === null)
      .map((a) => [a.vehicleId, a.employeeId]),
  );
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  return (
    <PageShell section={navLabels.vehicles}>
      <PageHeading
        title={navLabels.vehicles}
        description={pageDescriptions.vehicles}
      />
      {vehicles.length ? (
        <RecordsTable
          rows={vehicles}
          columns={[
            {
              key: "name",
              header: "רכב / מספר רישוי",
              className: "record-name",
              cell: (v) => `${v.make} ${v.model} · ${v.plate}`,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (v) => `${v.year} · ${v.notes}`,
            },
            {
              key: "assignee",
              header: "משויך לעובד",
              cell: (v) => {
                const employeeId = currentByVehicle.get(v.id);
                const employee = employeeId
                  ? employeeById.get(employeeId)
                  : null;
                return employee?.fullName ?? "ללא שיוך";
              },
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (v) => (
                <StatusBadge label={vehicleStatusLabels[v.status]} />
              ),
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (v) => formatDate(v.nextServiceDue),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין רכבים"
          description="כשיוגדר מקור נתונים, יופיעו כאן רכבי החברה."
        />
      )}
    </PageShell>
  );
}
