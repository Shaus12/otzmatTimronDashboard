import { getDataStore } from "@/lib/data";
import {
  formatDate,
  legalStatusLabels,
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

export default async function LegalPage() {
  const cases = await getDataStore().getLegalCases();

  return (
    <PageShell section={navLabels.legal}>
      <PageHeading
        title={navLabels.legal}
        description={pageDescriptions.legal}
      />
      {cases.length ? (
        <RecordsTable
          rows={cases}
          columns={[
            {
              key: "name",
              header: "שם / נושא",
              className: "record-name",
              cell: (c) => `${c.title} · ${c.caseNumber}`,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (c) => c.description,
            },
            {
              key: "assignee",
              header: "אחראי / איש קשר",
              cell: (c) => c.assigneeName || "—",
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (c) => <StatusBadge label={legalStatusLabels[c.status]} />,
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (c) => formatDate(c.dueDate),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין תיקים"
          description="כשיוגדר מקור נתונים, יופיעו כאן תיקים משפטיים."
        />
      )}
    </PageShell>
  );
}
