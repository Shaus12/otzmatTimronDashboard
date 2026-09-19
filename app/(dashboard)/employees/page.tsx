import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { EmployeesCrud } from "@/components/records/employees-crud";

export default async function EmployeesPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [employees, vehicles, assignments] = await Promise.all([
    store.getEmployees(),
    store.getVehicles(),
    store.getVehicleAssignments(),
  ]);

  const currentByEmployee = new Map(
    assignments
      .filter((a) => a.endDate === null)
      .map((a) => [a.employeeId, a.vehicleId]),
  );
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  const rows = employees.map((e) => {
    const vehicleId = currentByEmployee.get(e.id);
    const vehicle = vehicleId ? vehicleById.get(vehicleId) : null;
    return {
      ...e,
      assignedVehicle: vehicle
        ? `${vehicle.make} ${vehicle.model} · ${vehicle.plate}`
        : "ללא שיוך",
    };
  });

  return (
    <PageShell section={navLabels.employees}>
      <PageHeading
        title={navLabels.employees}
        description={pageDescriptions.employees}
      />
      <EmployeesCrud
        rows={rows}
        canWrite={canWrite(profile?.role, "employees")}
      />
    </PageShell>
  );
}
