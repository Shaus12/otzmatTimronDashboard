import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Banknote,
  CircleCheck,
  CircleDollarSign,
  DatabaseZap,
  ReceiptText,
} from "lucide-react";
import type { AdapterStatus } from "@/lib/adapters/types";
import type { Expense, Fine, Invoice } from "@/lib/data/types";
import { expenseCategoryLabels, formatMoney } from "@/lib/labels";

type BusinessIntelligenceProps = {
  expenses: Expense[];
  fines: Fine[];
  invoices: Invoice[];
  statuses: Record<string, AdapterStatus>;
};

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function BusinessIntelligence({
  expenses,
  fines,
  invoices,
  statuses,
}: BusinessIntelligenceProps) {
  const expenseTotal = sum(expenses.map((item) => item.amount));
  const pendingExpenseTotal = sum(
    expenses.filter((item) => item.status !== "ok").map((item) => item.amount),
  );
  const openFineTotal = sum(
    fines.filter((item) => item.status !== "paid").map((item) => item.amount),
  );
  const invoiceTotal = sum(invoices.map((item) => item.amount));
  const collectedTotal = sum(
    invoices.filter((item) => item.status === "paid").map((item) => item.amount),
  );
  const outstandingTotal = sum(
    invoices.filter((item) => item.status !== "paid").map((item) => item.amount),
  );
  const overdueTotal = sum(
    invoices.filter((item) => item.status === "overdue").map((item) => item.amount),
  );

  const statusValues = Object.values(statuses);
  const healthyConnections = statusValues.filter((status) =>
    ["connected", "imported"].includes(status.state),
  ).length;
  const simulatedConnections = statusValues.filter(
    (status) => status.state === "mock",
  ).length;
  const connectionIssues = statusValues.filter((status) =>
    ["error", "missing_access", "unrecognized"].includes(status.state),
  ).length;
  const availableSources = healthyConnections + simulatedConnections;

  const categoryTotals = expenses.reduce<Record<string, number>>((map, item) => {
    map[item.category] = (map[item.category] ?? 0) + item.amount;
    return map;
  }, {});
  const categoryRows = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const exposureRows = [
    {
      label: "גבייה פתוחה",
      value: outstandingTotal,
      color: "var(--bi-primary)",
    },
    {
      label: "קנסות פתוחים",
      value: openFineTotal,
      color: "var(--bi-coral)",
    },
    {
      label: "הוצאות בתקופה",
      value: expenseTotal,
      color: "var(--bi-mint)",
    },
  ];
  const maxExposure = Math.max(...exposureRows.map((row) => row.value), 1);
  const obligationTotal = expenseTotal + openFineTotal + outstandingTotal;

  const collectionRate = percentage(collectedTotal, invoiceTotal);
  const reviewedRate = percentage(
    sum(expenses.filter((item) => item.status === "ok").map((item) => item.amount)),
    expenseTotal,
  );
  const settledFineRate = percentage(
    sum(fines.filter((item) => item.status === "paid").map((item) => item.amount)),
    sum(fines.map((item) => item.amount)),
  );

  return (
    <section className="bi-section" aria-labelledby="bi-title">
      <div className="bi-section-heading">
        <div>
          <span className="bi-kicker">Business intelligence</span>
          <h2 id="bi-title">תמונת מצב עסקית</h2>
          <p>מדדים מחושבים מנתוני ההוצאות, הגבייה והחיבורים במערכת.</p>
        </div>
        <Link href="/reports" className="text-button">
          ניתוח מפורט <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="bi-grid">
        <article className="bi-card bi-exposure-card">
          <div className="bi-card-heading">
            <div>
              <span>חשיפה כספית</span>
              <strong>{formatMoney(obligationTotal)}</strong>
            </div>
            <span className="bi-period">נתונים נוכחיים</span>
          </div>
          <div className="exposure-chart" role="img" aria-label="השוואת גבייה פתוחה, קנסות פתוחים והוצאות">
            {exposureRows.map((row) => (
              <div className="exposure-row" key={row.label}>
                <span>{row.label}</span>
                <div className="exposure-track">
                  <i
                    style={{
                      width: `${Math.max((row.value / maxExposure) * 100, row.value ? 8 : 0)}%`,
                      background: row.color,
                    }}
                  />
                </div>
                <b>{formatMoney(row.value)}</b>
              </div>
            ))}
          </div>
          <div className="bi-inline-metrics">
            <div>
              <CircleDollarSign size={17} />
              <span>באיחור</span>
              <strong>{formatMoney(overdueTotal)}</strong>
            </div>
            <div>
              <ReceiptText size={17} />
              <span>הוצאות לבדיקה</span>
              <strong>{formatMoney(pendingExpenseTotal)}</strong>
            </div>
          </div>
        </article>

        <article className="bi-card bi-breakdown-card">
          <div className="bi-card-heading compact">
            <div>
              <span>תמהיל התחייבויות</span>
              <strong>{formatMoney(obligationTotal)}</strong>
            </div>
            <Banknote size={20} />
          </div>
          <div className="donut-wrap">
            <div
              className="bi-donut"
              style={{
                background: `conic-gradient(var(--bi-primary) 0 ${percentage(outstandingTotal, obligationTotal)}%, var(--bi-coral) ${percentage(outstandingTotal, obligationTotal)}% ${percentage(outstandingTotal + openFineTotal, obligationTotal)}%, var(--bi-mint) ${percentage(outstandingTotal + openFineTotal, obligationTotal)}% 100%)`,
              }}
            >
              <div>
                <strong>{percentage(outstandingTotal, obligationTotal)}%</strong>
                <span>גבייה</span>
              </div>
            </div>
            <div className="donut-legend">
              {exposureRows.map((row) => (
                <div key={row.label}>
                  <i style={{ background: row.color }} />
                  <span>{row.label}</span>
                  <b>{percentage(row.value, obligationTotal)}%</b>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="bi-card bi-progress-card">
          <div className="bi-card-heading compact">
            <div>
              <span>קצב טיפול</span>
              <strong>ביצוע מול יעד</strong>
            </div>
            <CircleCheck size={20} />
          </div>
          <div className="progress-metrics">
            {([
              ["גבייה שהושלמה", collectionRate],
              ["הוצאות שאושרו", reviewedRate],
              ["קנסות ששולמו", settledFineRate],
            ] as Array<[string, number]>).map(([label, value]) => (
              <div className="progress-row" key={String(label)}>
                <div><span>{label}</span><b>{value}%</b></div>
                <div className="progress-track"><i style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
          <Link href="/collections" className="bi-card-link">
            לפתיחת מרכז הגבייה <ArrowUpLeft size={15} />
          </Link>
        </article>

        <article className="bi-card bi-health-card">
          <div className="bi-card-heading compact">
            <div>
              <span>בריאות מקורות הנתונים</span>
              <strong>{statusValues.length} מקורות במעקב</strong>
            </div>
            <DatabaseZap size={20} />
          </div>
          <div className="health-score">
            <strong>{percentage(availableSources, statusValues.length)}%</strong>
            <span>מקורות זמינים בדאשבורד</span>
          </div>
          <div className="health-statuses">
            <span><i className="healthy" /> {healthyConnections} פעילים</span>
            <span><i className="simulated" /> {simulatedConnections} בדמו</span>
            <span><i className="issue" /> {connectionIssues} דורשים טיפול</span>
          </div>
          <Link href="/systems" className="bi-card-link">
            לניהול החיבורים <ArrowUpLeft size={15} />
          </Link>
        </article>

        <article className="bi-card bi-categories-card">
          <div className="bi-card-heading compact">
            <div>
              <span>הוצאות לפי קטגוריה</span>
              <strong>{expenses.length} רשומות</strong>
            </div>
          </div>
          <div className="category-list">
            {categoryRows.length ? categoryRows.map(([category, value]) => (
              <div key={category}>
                <span>{expenseCategoryLabels[category as keyof typeof expenseCategoryLabels] ?? category}</span>
                <div className="category-bar"><i style={{ width: `${percentage(value, expenseTotal)}%` }} /></div>
                <b>{formatMoney(value)}</b>
              </div>
            )) : <p className="bi-empty">אין עדיין נתוני הוצאות להצגה.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
