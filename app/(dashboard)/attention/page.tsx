import { getDataStore } from "@/lib/data";
import { buildAttentionQueue } from "@/lib/attention/queue";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { AttentionWorkspace } from "@/components/attention/attention-workspace";

export const dynamic = "force-dynamic";

export default async function AttentionPage() {
  const store = await getDataStore();
  const [expenses, fines, invoices] = await Promise.all([
    store.getExpenses(),
    store.getFines(),
    store.getInvoices(),
  ]);
  const items = buildAttentionQueue(expenses, fines, invoices);

  return (
    <PageShell section={navLabels.attention}>
      <PageHeading
        title={navLabels.attention}
        description={pageDescriptions.attention}
      />
      <AttentionWorkspace items={items} />
    </PageShell>
  );
}
