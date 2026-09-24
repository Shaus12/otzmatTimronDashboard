"use client";

import Link from "next/link";
import type { AttentionQueueItem } from "@/lib/attention/queue";

export function AttentionWorkspace({ items }: { items: AttentionQueueItem[] }) {
  return (
    <div className="attention-layout">
      <section className="attention-queue" aria-label="תור לטיפול">
        <div className="attention-queue-head">
          <h2>
            תור לטיפול{" "}
            <span className="count-badge">{items.length}</span>
          </h2>
          <p>הוצאות לבדיקה/חריגות וקנסות חדשים — מהחדש לישן.</p>
        </div>

        {!items.length ? (
          <p className="attention-empty">אין פריטים שדורשים תשומת לב כרגע.</p>
        ) : (
          <ul className="attention-queue-list">
            {items.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <div className="attention-queue-row">
                  <span
                    className={`status-badge attention-kind kind-${item.kind}`}
                  >
                    {item.kind === "expense"
                      ? "הוצאה"
                      : item.kind === "fine"
                        ? "קנס"
                        : "גבייה"}
                  </span>
                  <div className="attention-queue-body">
                    <strong dir="auto">{item.title}</strong>
                    <p dir="auto">{item.detail}</p>
                    <span className="attention-reason">{item.reason}</span>
                  </div>
                  <div className="attention-queue-aside">
                    <span className="attention-amount">{item.amountLabel}</span>
                    <Link href={item.href} className="text-button">
                      לטיפול →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
