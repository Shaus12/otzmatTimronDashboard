import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { LegalCrud } from "@/components/records/legal-crud";

export default async function LegalPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [cases, profiles] = await Promise.all([
    store.getLegalCases(),
    store.getProfiles(),
  ]);
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const rows = cases.map((c) => ({
    ...c,
    assigneeName: c.assignedTo
      ? (profileById.get(c.assignedTo)?.fullName ?? "—")
      : "—",
  }));

  return (
    <PageShell section={navLabels.legal}>
      <PageHeading
        title={navLabels.legal}
        description={pageDescriptions.legal}
      />
      <LegalCrud
        rows={rows}
        profiles={profiles}
        canWrite={canWrite(profile?.role, "legal")}
      />
    </PageShell>
  );
}
