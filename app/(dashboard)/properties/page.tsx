import { getDataStore } from "@/lib/data";
import {
  formatDate,
  navLabels,
  pageDescriptions,
  propertyStatusLabels,
} from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import {
  EmptyState,
  RecordsTable,
  StatusBadge,
} from "@/components/records/records-table";

export default async function PropertiesPage() {
  const properties = await getDataStore().getProperties();

  return (
    <PageShell section={navLabels.properties}>
      <PageHeading
        title={navLabels.properties}
        description={pageDescriptions.properties}
      />
      {properties.length ? (
        <RecordsTable
          rows={properties}
          columns={[
            {
              key: "name",
              header: "שם / נושא",
              className: "record-name",
              cell: (p) => p.name,
            },
            {
              key: "detail",
              header: "פרטים",
              className: "record-detail",
              cell: (p) => `${p.address} · ${p.description}`,
            },
            {
              key: "assignee",
              header: "אחראי / איש קשר",
              cell: (p) => p.contactName || "—",
            },
            {
              key: "status",
              header: "סטטוס",
              cell: (p) => (
                <StatusBadge label={propertyStatusLabels[p.status]} />
              ),
            },
            {
              key: "due",
              header: "מועד למעקב",
              className: "date-cell",
              cell: (p) => formatDate(p.followUpDate),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="אין נכסים"
          description="כשיוגדר מקור נתונים, יופיעו כאן דירות ונכסים."
        />
      )}
    </PageShell>
  );
}
