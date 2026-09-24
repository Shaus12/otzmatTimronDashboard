import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { buildAttentionQueue } from "@/lib/attention/queue";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { ExpensesWorkspace } from "@/components/expenses/expenses-workspace";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [expenses, employees, vehicles, clients, projects, fines, invoices] =
    await Promise.all([
      store.getExpenses(),
      store.getEmployees(),
      store.getVehicles(),
      store.getClients(),
      store.getProjects(),
      store.getFines(),
      store.getInvoices(),
    ]);

  const attentionCount = buildAttentionQueue(
    expenses,
    fines,
    invoices,
  ).length;

  return (
    <PageShell section={navLabels.expenses}>
      <PageHeading
        title={navLabels.expenses}
        description={pageDescriptions.expenses}
      />
      {attentionCount > 0 ? (
        <p className="expenses-attention-banner">
          <Link href="/attention" className="text-button">
            {attentionCount} פריטים דורשים תשומת לב →
          </Link>
        </p>
      ) : null}
      <ExpensesWorkspace
        expenses={expenses}
        employees={employees}
        vehicles={vehicles}
        clients={clients}
        projects={projects}
        canWrite={canWrite(profile?.role, "expenses")}
      />
    </PageShell>
  );
}
