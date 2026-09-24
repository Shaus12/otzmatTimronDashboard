import { getDataStore } from "@/lib/data";
import {
  buildAttentionQueue,
  buildPeriodSummary,
  parseAttentionPeriod,
} from "@/lib/attention/queue";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { ReportsWorkspace } from "@/components/reports/reports-workspace";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parseAttentionPeriod(params.period);
  const store = await getDataStore();
  const [expenses, fines, invoices] = await Promise.all([
    store.getExpenses(),
    store.getFines(),
    store.getInvoices(),
  ]);

  const attentionCount = buildAttentionQueue(
    expenses,
    fines,
    invoices,
  ).length;
  const summary = buildPeriodSummary(expenses, attentionCount, period);

  return (
    <PageShell section={navLabels.reports}>
      <PageHeading
        title={navLabels.reports}
        description={pageDescriptions.reports}
      />
      <ReportsWorkspace summary={summary} />
    </PageShell>
  );
}
