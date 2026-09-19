import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { FinesCrud } from "@/components/records/fines-crud";

export default async function FinesPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [fines, employees, vehicles] = await Promise.all([
    store.getFines(),
    store.getEmployees(),
    store.getVehicles(),
  ]);
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  const rows = fines.map((f) => {
    const vehicle = f.vehicleId ? vehicleById.get(f.vehicleId) : null;
    return {
      ...f,
      assigneeName: f.employeeId
        ? (employeeById.get(f.employeeId)?.fullName ?? "—")
        : "—",
      detailLine: `${f.description}${vehicle ? ` · ${vehicle.plate}` : ""}`,
    };
  });

  return (
    <PageShell section={navLabels.fines}>
      <PageHeading
        title={navLabels.fines}
        description={pageDescriptions.fines}
      />
      <FinesCrud
        rows={rows}
        employees={employees}
        vehicles={vehicles}
        canWrite={canWrite(profile?.role, "fines")}
      />
    </PageShell>
  );
}
