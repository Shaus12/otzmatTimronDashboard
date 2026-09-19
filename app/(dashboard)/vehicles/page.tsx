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
  const [vehicles, employees, assignments] = await Promise.all([
    store.getVehicles(),
    store.getEmployees(),
    store.getVehicleAssignments(),
  ]);

  const currentByVehicle = new Map(
    assignments
      .filter((a) => a.endDate === null)
      .map((a) => [a.vehicleId, a.employeeId]),
  );
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  const rows = vehicles.map((v) => {
    const employeeId = currentByVehicle.get(v.id) ?? "";
    return {
      ...v,
      assigneeEmployeeId: employeeId,
      assigneeName: employeeId
        ? (employeeById.get(employeeId)?.fullName ?? "ללא שיוך")
        : "ללא שיוך",
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
        canWrite={canWrite(profile?.role, "vehicles")}
      />
    </PageShell>
  );
}
