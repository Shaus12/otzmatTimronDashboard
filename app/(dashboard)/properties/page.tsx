import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { PropertiesCrud } from "@/components/records/properties-crud";

export default async function PropertiesPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const properties = await store.getProperties();

  return (
    <PageShell section={navLabels.properties}>
      <PageHeading
        title={navLabels.properties}
        description={pageDescriptions.properties}
      />
      <PropertiesCrud
        rows={properties}
        canWrite={canWrite(profile?.role, "properties")}
      />
    </PageShell>
  );
}
