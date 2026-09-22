import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import type { TimewatchSnapshot } from "@/lib/integrations/timewatch-schema";

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" });
}

export function TimewatchSummary({ snapshot, detailed = false }: {
  snapshot: TimewatchSnapshot; detailed?: boolean;
}) {
  const latest = snapshot.days[snapshot.days.length - 1];
  const total = latest.reported + latest.absenceReported + latest.notReported;
  const sourceTime = new Date(snapshot.sourceUpdatedAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  return (
    <section className="timewatch-summary" aria-label="נתוני TimeWatch שיובאו">
      <div className="section-heading">
        <div><h2>נוכחות עובדים · TimeWatch</h2><p>תמונת מצב ל־{dateLabel(latest.date)} · עדכון במקור: {sourceTime}</p></div>
        <span className="adapter-status-badge state-imported">נתוני אמת · ייבוא חד־פעמי</span>
      </div>
      <div className="attendance-metrics">
        {[["דיווחו נוכחות", latest.reported], ["טרם דיווחו", latest.notReported],
          ["דיווחי היעדרות", latest.absenceReported], ["עובדים בסיכום המקור", total]].map(([label, count]) => (
          <div key={label}><span>{label}</span><strong>{count}</strong></div>
        ))}
      </div>
      <p className="attendance-note">הנתונים נכונים לשעת הקריאה. “טרם דיווחו” אינו בהכרח היעדרות. יתר נתוני הדמו בדאשבורד מוצגים בנפרד.</p>
      {detailed ? <>
        <h3>דיווחי נוכחות בתאריכים שנבדקו</h3>
        <p className="attendance-note">כל עמודה מציגה תאריך שנקרא מהמקור; אין כאן סדרה יומית מלאה.</p>
        <div className="attendance-legend"><span><i className="reported"/>דיווחו נוכחות</span><span><i className="absence"/>דיווחי היעדרות</span><span><i className="pending"/>טרם דיווחו</span></div>
        <div className="attendance-chart" role="img" aria-label={snapshot.days.map(day => `${dateLabel(day.date)}: ${day.reported} דיווחו, ${day.absenceReported} דיווחי היעדרות, ${day.notReported} טרם דיווחו`).join("; ")}>
          {snapshot.days.map(day => {
            const sum = day.reported + day.absenceReported + day.notReported;
            return <div className="attendance-chart-row" key={day.date}>
              <span>{dateLabel(day.date)}</span>
              <div className="attendance-bar" aria-hidden="true">
                {sum ? <><i className="reported" style={{ width: `${day.reported / sum * 100}%` }}/><i className="absence" style={{ width: `${day.absenceReported / sum * 100}%` }}/><i className="pending" style={{ width: `${day.notReported / sum * 100}%` }}/></> : <small>אין עובדים בסיכום</small>}
              </div><b>{day.reported} מתוך {sum}</b>
            </div>;
          })}
        </div>
        <div className="attendance-table-wrap"><table className="attendance-table">
          <caption>פירוט הנתונים שנקראו מ־TimeWatch</caption>
          <thead><tr><th>תאריך</th><th>דיווחו</th><th>דיווחי היעדרות</th><th>טרם דיווחו</th></tr></thead>
          <tbody>{snapshot.days.map(day => <tr key={day.date}><td>{dateLabel(day.date)}</td><td>{day.reported}</td><td>{day.absenceReported}</td><td>{day.notReported}</td></tr>)}</tbody>
        </table></div>
        <p className="attendance-note">{snapshot.hoursAccess === "denied" ? "המקור מציין שאין לחשבון הרשאה לצפות בשעות עבודה מול התקן. המדד אינו מוצג." : "שעות עבודה מול התקן לא נכללו בייבוא."} נתוני שכר ושעות לעובד אינם כלולים בתצוגה זו.</p>
        <a className="text-button" href="https://a.timewatch.co.il/dashboard.php" target="_blank" rel="noopener noreferrer">פתיחת TimeWatch<ArrowUpLeft size={16}/></a>
      </> : <Link className="text-button" href="/systems/timewatch">לפירוט ולהשוואה בין ימים<ArrowLeft size={16}/></Link>}
    </section>
  );
}
