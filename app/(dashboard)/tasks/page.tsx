import { getDataStore } from "@/lib/data";
import {
  formatDate,
  navLabels,
  pageDescriptions,
  taskStatusLabels,
} from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";

export default async function TasksPage() {
  const store = getDataStore();
  const [tasks, employees] = await Promise.all([
    store.getTasks(),
    store.getEmployees(),
  ]);
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  return (
    <PageShell section={navLabels.tasks}>
      <PageHeading
        title={navLabels.tasks}
        description={pageDescriptions.tasks}
      />
      {tasks.length ? (
        <RecordsTable
          rows={tasks}
          columns={[
            {
              key: "name",
              header: "שם / נושא",
              className: "record-name",
              cell: (t) => t.title,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (t) => t.description,
            },
            {
              key: "assignee",
              header: "אחראי / איש קשר",
              cell: (t) =>
                t.assigneeEmployeeId
                  ? (employeeById.get(t.assigneeEmployeeId)?.fullName ?? "—")
                  : "—",
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (t) => <StatusBadge label={taskStatusLabels[t.status]} />,
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (t) => formatDate(t.dueDate),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין משימות"
          description="כשיוגדר מקור נתונים, יופיעו כאן משימות ומעקב."
        />
      )}
    </PageShell>
  );
}
