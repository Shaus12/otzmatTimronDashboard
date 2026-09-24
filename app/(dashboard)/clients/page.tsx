import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { ClientsCrud } from "@/components/records/clients-crud";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const clients = await store.getClients();

  return (
    <PageShell section={navLabels.clients}>
      <PageHeading
        title={navLabels.clients}
        description={pageDescriptions.clients}
      />
      <ClientsCrud
        rows={clients}
        canWrite={canWrite(profile?.role, "clients")}
      />
    </PageShell>
  );
}
