import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { TimewatchSummary } from "@/components/home/timewatch-summary";
import { readTimewatchSnapshot } from "@/lib/integrations/timewatch-snapshot";

export const dynamic = "force-dynamic";

export default async function TimewatchPage() {
  const result = await readTimewatchSnapshot();
  return <PageShell section="TimeWatch · נוכחות">
    <Link className="text-button" href="/">→ חזרה לסקירה</Link>
    <PageHeading title="תמונת הנוכחות" description="נתונים שנקראו ממערכת TimeWatch, עם תאריך המקור ומצב הגישה."/>
    {result.snapshot ? <TimewatchSummary snapshot={result.snapshot} detailed/> :
      <section className="timewatch-summary"><h2>{result.state === "error" ? "לא ניתן לקרוא את קובץ הנתונים" : "עדיין אין נתוני מקור זמינים"}</h2><p>תצוגת נתוני האמת זמינה כעת בייבוא מקומי בלבד. סנכרון אוטומטי עדיין לא הוגדר.</p></section>}
  </PageShell>;
}
