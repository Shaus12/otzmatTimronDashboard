"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  AttentionPeriod,
  PeriodSummary,
} from "@/lib/attention/queue";
import { attentionPeriodLabels } from "@/lib/attention/queue";
import { formatDate, formatMoney } from "@/lib/labels";

const PERIODS: AttentionPeriod[] = ["today", "week", "month"];

function periodRangeLabel(summary: PeriodSummary): string {
  if (summary.from === summary.to) return formatDate(summary.from);
  return `${formatDate(summary.from)} – ${formatDate(summary.to)}`;
}

export function ReportsWorkspace({ summary }: { summary: PeriodSummary }) {
  const router = useRouter();
  const hasExpenses = summary.expenseCount > 0;

  return (
    <div className="reports-layout">
      <section className="reports-panel" aria-label="סיכום תקופתי">
        <header className="reports-panel-head">
          <div>
            <p className="reports-eyebrow">סיכום הוצאות</p>
            <h2 className="reports-period-title">
              {attentionPeriodLabels[summary.period]}
            </h2>
            <p className="reports-period-range">{periodRangeLabel(summary)}</p>
          </div>
          <div
            className="reports-period-tabs"
            role="tablist"
            aria-label="בחירת תקופה"
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={summary.period === p}
                className={
                  summary.period === p
                    ? "reports-period-tab active"
                    : "reports-period-tab"
                }
                onClick={() => router.push(`/reports?period=${p}`)}
              >
                {attentionPeriodLabels[p]}
              </button>
            ))}
          </div>
        </header>

        {hasExpenses ? (
          <div className="reports-totals">
            {summary.totalsByCurrency.map((t) => (
              <div key={t.currency} className="reports-total-card">
                <span className="reports-total-label">{t.currency}</span>
                <strong className="reports-total-amount" dir="ltr">
                  {formatMoney(t.total, t.currency)}
                </strong>
                <em className="reports-total-count">
                  {t.count} {t.count === 1 ? "רשומה" : "רשומות"}
                </em>
              </div>
            ))}
            <p className="reports-totals-meta">
              סה״כ {summary.expenseCount} הוצאות בתקופה
            </p>
          </div>
        ) : (
          <p className="reports-empty">אין נתונים לתקופה שנבחרה.</p>
        )}

        <div className="reports-breakdown">
          <h3>פירוט לפי קטגוריה</h3>
          {summary.categoryRows.length ? (
            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>קטגוריה</th>
                    <th>מטבע</th>
                    <th className="num">כמות</th>
                    <th className="num">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.categoryRows.map((row) => (
                    <tr key={`${row.category}-${row.currency}`}>
                      <td>{row.label}</td>
                      <td>{row.currency}</td>
                      <td className="num">{row.count}</td>
                      <td className="num" dir="ltr">
                        {formatMoney(row.total, row.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="reports-empty">אין נתונים לתקופה שנבחרה.</p>
          )}
        </div>
      </section>

      <aside className="reports-cta" aria-label="תור לטיפול">
        <div className="reports-cta-body">
          <p className="reports-eyebrow">פעולה נדרשת</p>
          <h3>תור לטיפול</h3>
          <p>
            {summary.attentionCount > 0
              ? `${summary.attentionCount} פריטים ממתינים לבדיקה — הוצאות, חריגות וקנסות.`
              : "אין פריטים שממתינים לטיפול כרגע."}
          </p>
        </div>
        <div className="reports-cta-aside">
          <strong className="reports-cta-count">
            {String(summary.attentionCount).padStart(2, "0")}
          </strong>
          <Link href="/attention" className="reports-cta-link">
            מעבר לתור →
          </Link>
        </div>
      </aside>
    </div>
  );
}
