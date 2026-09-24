import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import { formatDate, legalStatusLabels, navLabels } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { StatusBadge } from "@/components/records/records-table";
import { LegalCaseNotes } from "@/components/legal/legal-case-notes";
import { DocumentUploader } from "@/components/documents/document-uploader";

export const dynamic = "force-dynamic";

export default async function LegalCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const legalCase = await store.getLegalCase(id);
  if (!legalCase) notFound();

  const [notes, profiles] = await Promise.all([
    store.getLegalCaseNotes(id),
    store.getProfiles(),
  ]);
  const assignee = legalCase.assignedTo
    ? profiles.find((p) => p.id === legalCase.assignedTo)
    : null;

  return (
    <PageShell section={navLabels.legal}>
      <p className="legal-back">
        <Link href="/legal" className="text-button">
          ← חזרה לתיקים
        </Link>
      </p>
      <PageHeading
        title={legalCase.title}
        description={`${legalCase.caseNumber} · ${legalCase.description || "ללא פרטים נוספים"}`}
      />

      <section className="timewatch-summary legal-case-summary">
        <dl className="legal-case-meta">
          <div>
            <dt>סטטוס</dt>
            <dd>
              <StatusBadge label={legalStatusLabels[legalCase.status]} />
            </dd>
          </div>
          <div>
            <dt>מועד למעקב</dt>
            <dd>{formatDate(legalCase.dueDate)}</dd>
          </div>
          <div>
            <dt>אחראי</dt>
            <dd dir="auto">{assignee?.fullName ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <LegalCaseNotes
        legalCaseId={legalCase.id}
        notes={notes}
        canWrite={canWrite(profile?.role, "legal")}
      />

      <section className="timewatch-summary">
        <DocumentUploader
          entityType="legal_case"
          entityId={legalCase.id}
          canWrite={canWrite(profile?.role, "legal")}
        />
      </section>
    </PageShell>
  );
}
