import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { GmailSnapshot } from "@/lib/integrations/gmail-schema";

export function GmailSummary({ snapshot, detailed = false }: { snapshot: GmailSnapshot; detailed?: boolean }) {
  const reminders = snapshot.records.filter(row => row.kind === "reminder");
  const vendors = [...new Set(snapshot.records.map(row => row.vendor))];
  const date = new Date(snapshot.capturedAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  return <section className="timewatch-summary" aria-label="נתוני Gmail שיובאו">
    <div className="section-heading"><div><h2>חשבוניות ועדכונים · Gmail</h2><p>מדגם מתיבת החברה · נקרא ב־{date}</p></div><span className="adapter-status-badge state-imported">נתוני אמת · ייבוא חד־פעמי</span></div>
    <div className="attendance-metrics">
      {[["לא נקראו בתיבת הדואר הנכנס", snapshot.unreadInbox], ["שיחות במדגם", snapshot.records.length], ["שולחים במדגם", vendors.length], ["תזכורות לבדיקה במדגם", reminders.length]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>
    <p className="attendance-note">זהו מדגם נבחר, ולא סיכום של כל חשבוניות החברה. תזכורת במייל אינה הוכחה לחוב שעדיין פתוח. סכומים שלא נבדקו במסמך המקור אינם נכללים בסיכום כספי.</p>
    {detailed ? <>
      <h3>שיחות לפי שולח במדגם</h3>
      <div className="attendance-chart" aria-label="מספר שיחות לפי שולח">
        {vendors.map(vendor => {
          const count = snapshot.records.filter(row => row.vendor === vendor).length;
          return <div key={vendor} className="attendance-chart-row"><span>{vendor}</span><div className="attendance-bar"><i className="reported" style={{ width: `${count / snapshot.records.length * 100}%` }}/></div><b>{count} שיחות</b></div>;
        })}
      </div>
      <div className="attendance-table-wrap"><table className="attendance-table">
        <caption>פריטים שנמצאו · קישורים למקור וסכומים מאומתים בלבד</caption>
        <thead><tr><th>תאריך</th><th>שולח / נושא</th><th>סוג</th><th>סכום</th><th>מה נמצא</th><th>מקור</th></tr></thead>
        <tbody>{snapshot.records.map(row => <tr key={row.id}>
          <td style={{whiteSpace:"nowrap"}}>{new Date(row.date).toLocaleDateString("he-IL")}</td>
          <td><b>{row.vendor}</b><p>{row.subject}</p></td><td>{row.kind === "reminder" ? "תזכורת לבדיקה" : "הודעת חשבונית"}</td>
          <td>{row.amount === null ? "לא נבדק" : new Intl.NumberFormat("he-IL",{ style:"currency",currency:"ILS" }).format(row.amount)}</td>
          <td>{row.note}{row.attachmentCount !== null ? <p>{row.attachmentCount} קבצים שנצפו</p> : null}</td>
          <td><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">למייל</a></td>
        </tr>)}</tbody>
      </table></div>
      <details className="attendance-note"><summary>היקף הסריקה ומצב החיבור</summary><p>בחיפוש הראשוני נמצאו {snapshot.search.matchedThreads} שיחות תואמות. התוצאות כוללות גם התכתבויות תמיכה ומסמכים שאינם חשבוניות. בנוסף נבדקה שיחת כביש 6 מאוגוסט.</p><p dir="ltr">{snapshot.search.query}</p><p>הכניסה לדפדפן הושלמה. חיבור API וסנכרון אוטומטי עדיין לא הוגדרו.</p></details>
    </> : <Link href="/systems/gmail" className="text-button">לחשבוניות ולתזכורות שנמצאו<ArrowLeft size={16}/></Link>}
  </section>;
}
