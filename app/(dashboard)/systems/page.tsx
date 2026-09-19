import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { SystemsCrud } from "@/components/systems/systems-crud";

export default async function SystemsPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const systems = await store.getSystems();

  return (
    <PageShell section={navLabels.systems}>
      <PageHeading
        title={navLabels.systems}
        description={pageDescriptions.systems}
      />
      <SystemsCrud
        systems={systems}
        canWrite={canWrite(profile?.role, "systems")}
      />
    </PageShell>
  );
}
