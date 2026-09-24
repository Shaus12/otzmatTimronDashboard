import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import {
  listImportBatches,
  listImportTemplates,
} from "@/lib/imports/store";
import type { ImportTargetTable } from "@/lib/imports/types";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { ImportsWorkspace } from "@/components/imports/imports-workspace";

export const dynamic = "force-dynamic";

function canAccessImports(role: string | undefined): boolean {
  return role === "admin" || role === "accounting";
}

export default async function ImportsPage() {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessImports(profile.role)) {
    redirect("/?imports=forbidden");
  }

  const store = await getDataStore();
  let templates: Awaited<ReturnType<typeof listImportTemplates>> = [];
  let batches: Awaited<ReturnType<typeof listImportBatches>> = [];
  let expenses: Awaited<ReturnType<typeof store.getExpenses>> = [];
  let loadError: string | null = null;

  try {
    [templates, batches, expenses] = await Promise.all([
      listImportTemplates(),
      listImportBatches(),
      store.getExpenses(),
    ]);
  } catch (e) {
    loadError =
      e instanceof Error
        ? e.message
        : "לא ניתן לטעון היסטוריית ייבוא — ודאו שהמיגרציה הורצה";
  }

  const allowedTargets = (
    ["expenses", "fines", "invoices"] as ImportTargetTable[]
  ).filter((t) => canWrite(profile.role, t));

  return (
    <PageShell section={navLabels.imports}>
      <PageHeading
        title={navLabels.imports}
        description={pageDescriptions.imports}
      />
      {loadError ? <p className="form-error">{loadError}</p> : null}
      <ImportsWorkspace
        templates={templates}
        batches={batches}
        expenses={expenses}
        allowedTargets={allowedTargets}
      />
    </PageShell>
  );
}
