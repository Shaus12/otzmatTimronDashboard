import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getAdapterStatusesForSystems } from "@/lib/adapters";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { SystemsCrud } from "@/components/systems/systems-crud";

export default async function SystemsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string; email?: string }>;
}) {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const systems = await store.getSystems();
  const statuses = await getAdapterStatusesForSystems(systems);
  const params = await searchParams;

  return (
    <PageShell section={navLabels.systems}>
      <PageHeading
        title={navLabels.systems}
        description={pageDescriptions.systems}
      />
      <SystemsCrud
        systems={systems}
        statuses={statuses}
        canWrite={canWrite(profile?.role, "systems")}
        isAdmin={profile?.role === "admin"}
        gmailReplaceEmail={
          params.gmail === "confirm_replace" ? params.email ?? "" : null
        }
        gmailFlash={params.gmail ?? null}
      />
    </PageShell>
  );
}
