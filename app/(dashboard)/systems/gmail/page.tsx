import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { gmailAdapter } from "@/lib/adapters/sources/gmail";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { GmailSummary } from "@/components/home/gmail-summary";
import { readGmailSnapshot } from "@/lib/integrations/gmail-snapshot";

export const dynamic = "force-dynamic";

export default async function GmailPage() {
  const profile = await getCurrentProfile();
  const status = await gmailAdapter.checkStatus();
  const liveMessages =
    status.state === "connected" ? await gmailAdapter.fetchData() : [];
  const snapshot = await readGmailSnapshot();

  return (
    <PageShell section="Gmail · חשבוניות ועדכונים">
      <Link className="text-button" href="/systems">
        → חזרה למערכות
      </Link>
      <PageHeading
        title="מהמייל לתמונת המצב"
        description="הודעות אחרונות מתיבת Gmail (קריאה בלבד). פענוח והוצאות — במסך הייבוא."
      />

      {status.state === "connected" && profile?.role === "admin" ? (
        <p>
          <Link className="text-button" href="/systems/gmail/import">
            סקירת חילוץ וייבוא הוצאות →
          </Link>
        </p>
      ) : null}

      {status.state === "connected" ? (
        <section className="timewatch-summary">
          <h2>הודעות אחרונות (חי)</h2>
          <p>
            {liveMessages.length
              ? `${liveMessages.length} הודעות עם נושא דמוי חשבונית/קבלה`
              : "אין הודעות תואמות בשלושת החודשים האחרונים"}
          </p>
          {liveMessages.length ? (
            <div className="records-table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>נושא</th>
                    <th>מאת</th>
                    <th>תאריך</th>
                    <th>תקציר</th>
                  </tr>
                </thead>
                <tbody>
                  {liveMessages.map((m) => (
                    <tr key={m.id}>
                      <td dir="auto">{m.subject}</td>
                      <td dir="auto">{m.from}</td>
                      <td>{m.date}</td>
                      <td dir="auto">{m.snippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="timewatch-summary">
          <h2>Gmail לא מחובר</h2>
          <p>
            {status.message ??
              "לחצו «התחבר» בכרטיס Gmail במסך המערכות כדי לאשר גישה לקריאה בלבד."}
          </p>
          <Link className="text-button" href="/api/auth/gmail/start">
            התחבר ל־Gmail
          </Link>
        </section>
      )}

      {snapshot.snapshot ? (
        <GmailSummary snapshot={snapshot.snapshot} detailed />
      ) : null}
    </PageShell>
  );
}
