import { getDataStore } from "@/lib/data";
import {
  formatDate,
  formatIls,
  fineStatusLabels,
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

export default async function FinesPage() {
  const store = getDataStore();
  const [fines, employees, vehicles] = await Promise.all([
    store.getFines(),
    store.getEmployees(),
    store.getVehicles(),
  ]);
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <PageShell section={navLabels.fines}>
      <PageHeading
        title={navLabels.fines}
        description={pageDescriptions.fines}
      />
      {fines.length ? (
        <RecordsTable
          rows={fines}
          columns={[
            {
              key: "name",
              header: "שם / נושא",
              className: "record-name",
              cell: (f) => f.title,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (f) => {
                const vehicle = f.vehicleId
                  ? vehicleById.get(f.vehicleId)
                  : null;
                const vehiclePart = vehicle
                  ? ` · ${vehicle.plate}`
                  : "";
                return `${f.description}${vehiclePart} · ${formatIls(f.amountIls)}`;
              },
            },
            {
              key: "assignee",
              header: "אחראי / איש קשר",
              cell: (f) =>
                f.assigneeEmployeeId
                  ? (employeeById.get(f.assigneeEmployeeId)?.fullName ?? "—")
                  : "—",
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (f) => <StatusBadge label={fineStatusLabels[f.status]} />,
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (f) => formatDate(f.dueDate),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין קנסות"
          description="כשיוגדר מקור נתונים, יופיעו כאן קנסות ואגרות."
        />
      )}
    </PageShell>
  );
}
