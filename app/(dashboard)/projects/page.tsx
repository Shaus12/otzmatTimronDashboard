import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { ProjectsCrud } from "@/components/records/projects-crud";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [projects, clients] = await Promise.all([
    store.getProjects(),
    store.getClients(),
  ]);
  const clientById = new Map(clients.map((c) => [c.id, c]));
  const rows = projects.map((p) => ({
    ...p,
    clientName: p.clientId
      ? (clientById.get(p.clientId)?.name ?? "—")
      : "ללא לקוח",
  }));

  return (
    <PageShell section={navLabels.projects}>
      <PageHeading
        title={navLabels.projects}
        description={pageDescriptions.projects}
      />
      <ProjectsCrud
        rows={rows}
        clients={clients}
        canWrite={canWrite(profile?.role, "projects")}
      />
    </PageShell>
  );
}
