import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { VehiclesCrud } from "@/components/records/vehicles-crud";

export default async function VehiclesPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [vehicles, employees, clients, assignments] = await Promise.all([
    store.getVehicles(),
    store.getEmployees(),
    store.getClients(),
    store.getVehicleAssignments(),
  ]);

  const currentByVehicle = new Map(
    assignments
      .filter((a) => a.endDate === null)
      .map((a) => [a.vehicleId, a.employeeId]),
  );
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const clientById = new Map(clients.map((c) => [c.id, c]));

  const rows = vehicles.map((v) => {
    const employeeId = currentByVehicle.get(v.id) ?? "";
    const clientId = !employeeId ? (v.clientId ?? "") : "";
    let assigneeName = "ללא שיוך";
    if (employeeId) {
      assigneeName = `עובד · ${employeeById.get(employeeId)?.fullName ?? "—"}`;
    } else if (clientId) {
      assigneeName = `לקוח · ${clientById.get(clientId)?.name ?? "—"}`;
    }
    return {
      ...v,
      assigneeEmployeeId: employeeId,
      assigneeClientId: clientId,
      assigneeName,
    };
  });

  return (
    <PageShell section={navLabels.vehicles}>
      <PageHeading
        title={navLabels.vehicles}
        description={pageDescriptions.vehicles}
      />
      <VehiclesCrud
        rows={rows}
        employees={employees}
        clients={clients}
        canWrite={canWrite(profile?.role, "vehicles")}
      />
    </PageShell>
  );
}
