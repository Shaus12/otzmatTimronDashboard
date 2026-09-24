import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { AttentionQueueItem } from "@/lib/attention/queue";

export function AttentionPanel({ items }: { items: AttentionQueueItem[] }) {
  const preview = items.slice(0, 4);

  return (
    <section className="task-panel attention-home-panel">
      <div className="section-heading">
        <h2>
          דורש תשומת לב{" "}
          <span className="count-badge">{items.length}</span>
        </h2>
        <AlertTriangle size={20} />
      </div>
      <p className="panel-intro">הוצאות לבדיקה, חריגות וקנסות חדשים</p>
      <div className="task-list">
        {preview.length ? (
          preview.map((item, index) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="task-entry"
            >
              <span className="task-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 dir="auto">{item.title}</h3>
                <p dir="auto">
                  {item.kind === "expense"
                    ? "הוצאה"
                    : item.kind === "fine"
                      ? "קנס"
                      : "גבייה"}{" "}
                  · {item.reason}
                </p>
                <span className="task-status">{item.amountLabel}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="all-done">אין פריטים שממתינים לטיפול</p>
        )}
      </div>
      <Link className="panel-footer" href="/attention">
        לכל הפריטים בתור
        <ArrowLeft size={16} />
      </Link>
    </section>
  );
}
