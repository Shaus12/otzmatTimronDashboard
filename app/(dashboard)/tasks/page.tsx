import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { TasksCrud } from "@/components/records/tasks-crud";

export default async function TasksPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [tasks, employees] = await Promise.all([
    store.getTasks(),
    store.getEmployees(),
  ]);
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  const rows = tasks.map((t) => ({
    ...t,
    assigneeName: t.assignedTo
      ? (employeeById.get(t.assignedTo)?.fullName ?? "—")
      : "—",
  }));

  return (
    <PageShell section={navLabels.tasks}>
      <PageHeading
        title={navLabels.tasks}
        description={pageDescriptions.tasks}
      />
      <TasksCrud
        rows={rows}
        employees={employees}
        canWrite={canWrite(profile?.role, "tasks")}
      />
    </PageShell>
  );
}
