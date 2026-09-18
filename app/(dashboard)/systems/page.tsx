import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { SystemsBrowser } from "@/components/systems/systems-browser";

export default async function SystemsPage() {
  const systems = await getDataStore().getSystems();

  return (
    <PageShell section={navLabels.systems}>
      <PageHeading
        title={navLabels.systems}
        description={pageDescriptions.systems}
      />
      <SystemsBrowser systems={systems} />
    </PageShell>
  );
}
