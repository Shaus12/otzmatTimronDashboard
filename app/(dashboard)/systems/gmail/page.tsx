import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { GmailSummary } from "@/components/home/gmail-summary";
import { readGmailSnapshot } from "@/lib/integrations/gmail-snapshot";

export const dynamic = "force-dynamic";

export default async function GmailPage() {
  const result = await readGmailSnapshot();
  return <PageShell section="Gmail · חשבוניות ועדכונים">
    <Link className="text-button" href="/">→ חזרה לסקירה</Link>
    <PageHeading title="מהמייל לתמונת המצב" description="חשבוניות ותזכורות שנמצאו בתיבת החברה, עם הפניה למקור."/>
    {result.snapshot ? <GmailSummary snapshot={result.snapshot} detailed/> : <section className="timewatch-summary"><h2>{result.state === "error" ? "לא ניתן לקרוא את קובץ הנתונים" : "עדיין אין נתוני דואר זמינים"}</h2><p>תצוגת נתוני האמת זמינה בייבוא מקומי בלבד. סנכרון אוטומטי עדיין לא הוגדר.</p></section>}
  </PageShell>;
}
