import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { buildCollectionRows } from "@/lib/collections/status";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { CollectionsWorkspace } from "@/components/collections/collections-workspace";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [invoices, payments, clients] = await Promise.all([
    store.getInvoices(),
    store.getPayments(),
    store.getClients(),
  ]);
  const rows = buildCollectionRows(invoices, payments, clients);
  const canEdit = canWrite(profile?.role, "invoices");
  const canOpenTask =
    canWrite(profile?.role, "tasks") || canWrite(profile?.role, "invoices");

  return (
    <PageShell section={navLabels.collections}>
      <PageHeading
        title={navLabels.collections}
        description={pageDescriptions.collections}
      />
      <CollectionsWorkspace
        rows={rows}
        clients={clients}
        canWrite={canEdit}
        canOpenTask={canOpenTask}
      />
    </PageShell>
  );
}
