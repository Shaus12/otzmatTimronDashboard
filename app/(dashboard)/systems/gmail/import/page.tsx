import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getDataStore } from "@/lib/data";
import { gmailAdapter } from "@/lib/adapters/sources/gmail";
import {
  annotateDuplicates,
  fetchGmailExpenseCandidates,
  importedGmailMessageIds,
} from "@/lib/gmail/expense-candidates";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { GmailImportTable } from "@/components/systems/gmail-import-table";

export const dynamic = "force-dynamic";

export default async function GmailImportPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/systems?gmail=forbidden");
  }

  const params = await searchParams;
  const status = await gmailAdapter.checkStatus();
  const store = await getDataStore();

  let candidates: Awaited<ReturnType<typeof annotateDuplicates>> = [];
  let loadError: string | null = null;

  if (status.state === "connected") {
    try {
      const expenses = await store.getExpenses();
      const importedIds = importedGmailMessageIds(expenses);
      const raw = await fetchGmailExpenseCandidates(25, importedIds);
      candidates = annotateDuplicates(raw, expenses);
    } catch (e) {
      loadError =
        e instanceof Error ? e.message : "לא ניתן לטעון הודעות מ־Gmail";
    }
  } else if (status.state === "error") {
    loadError =
      status.message ??
      "חיבור Gmail פג או בוטל — התחברו מחדש במסך המערכות";
  }

  return (
    <PageShell section="Gmail · ייבוא הוצאות">
      <Link className="text-button" href="/systems/gmail">
        → חזרה להודעות Gmail
      </Link>
      <PageHeading
        title="סקירת חילוץ וייבוא"
        description="פענוח ראשוני מהמיילים — בחרו שורות ואישרו ידנית. אין ייבוא אוטומטי."
      />

      {params.imported ? (
        <p className="adapter-status-message">
          ייובאו {params.imported} הוצאות בסטטוס «דורש בדיקה».
        </p>
      ) : null}

      {status.state === "error" ? (
        <section className="timewatch-summary">
          <h2>חיבור Gmail שבור</h2>
          <p>
            {status.message ??
              "חיבור Gmail פג או בוטל — התחברו מחדש במסך המערכות."}
          </p>
          <Link className="text-button" href="/api/auth/gmail/start">
            התחבר מחדש ל־Gmail
          </Link>
        </section>
      ) : status.state !== "connected" ? (
        <section className="timewatch-summary">
          <h2>Gmail לא מחובר</h2>
          <p>{status.message ?? "יש להתחבר ל־Gmail לפני ייבוא."}</p>
          <Link className="text-button" href="/api/auth/gmail/start">
            התחבר ל־Gmail
          </Link>
        </section>
      ) : loadError ? (
        <section className="timewatch-summary">
          <h2>שגיאה בטעינה</h2>
          <p>{loadError}</p>
        </section>
      ) : (
        <GmailImportTable candidates={candidates} />
      )}
    </PageShell>
  );
}
