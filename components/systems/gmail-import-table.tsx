"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { GmailExpenseCandidatePreview } from "@/lib/gmail/expense-candidates";
import { importGmailExpensesAction } from "@/app/(dashboard)/systems/gmail/import/actions";

export function GmailImportTable({
  candidates,
}: {
  candidates: GmailExpenseCandidatePreview[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const c of candidates) {
      // Pre-check rows with a parsed amount that are not duplicates.
      init[c.messageId] = c.amount != null && !c.isDuplicate;
    }
    return init;
  });

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (on: boolean) => {
    const next: Record<string, boolean> = {};
    for (const c of candidates) {
      next[c.messageId] = on && c.amount != null;
    }
    setSelected(next);
  };

  const onImport = () => {
    setError(null);
    const rows = candidates.filter((c) => selected[c.messageId] && c.amount != null);
    if (!rows.length) {
      setError("בחרו לפחות שורה אחת עם סכום מזוהה");
      return;
    }
    startTransition(async () => {
      try {
        const result = await importGmailExpensesAction(
          rows.map((r) => ({
            messageId: r.messageId,
            vendor: r.vendor,
            amount: r.amount as number,
            currency: r.currency || "ILS",
            date: r.date,
            description: r.description,
            category: r.category,
            rawSubject: r.rawSubject,
          })),
        );
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
        router.push(`/systems/gmail/import?imported=${result.imported}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "הייבוא נכשל");
      }
    });
  };

  if (!candidates.length) {
    return (
      <section className="timewatch-summary">
        <h2>אין מועמדים לייבוא</h2>
        <p>לא נמצאו הודעות דמויות חשבונית/קבלה בשלושת החודשים האחרונים.</p>
      </section>
    );
  }

  return (
    <section className="timewatch-summary">
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <div>
          <h2>מועמדים מחילוץ Gmail</h2>
          <p>
            סמנו שורות לייבוא. סטטוס תמיד «דורש בדיקה» — לא מאושר אוטומטית.
            כפילויות מסומנות אך לא חוסמות.
          </p>
        </div>
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => toggleAll(true)}>
            בחר הכל
          </Button>
          <Button type="button" variant="outline" onClick={() => toggleAll(false)}>
            נקה בחירה
          </Button>
          <Button
            type="button"
            className="primary-action"
            disabled={pending || selectedIds.length === 0}
            onClick={onImport}
          >
            {pending ? "מייבא…" : `ייבא נבחרים (${selectedIds.length})`}
          </Button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="records-table-wrap">
        <table className="records-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="בחר הכל"
                  checked={
                    candidates.filter((c) => c.amount != null).length > 0 &&
                    candidates
                      .filter((c) => c.amount != null)
                      .every((c) => selected[c.messageId])
                  }
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th>ספק</th>
              <th>סכום</th>
              <th>מטבע</th>
              <th>תאריך</th>
              <th>תיאור</th>
              <th>נושא מקורי</th>
              <th>הערות</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.messageId} className={c.isDuplicate ? "row-flagged" : undefined}>
                <td>
                  <input
                    type="checkbox"
                    disabled={c.amount == null}
                    checked={Boolean(selected[c.messageId])}
                    onChange={() => toggle(c.messageId)}
                    aria-label={`בחירת ${c.vendor}`}
                  />
                </td>
                <td dir="auto">{c.vendor}</td>
                <td>{c.amount != null ? c.amount.toLocaleString("he-IL") : "—"}</td>
                <td>{c.currency ?? "—"}</td>
                <td>{c.date}</td>
                <td dir="auto">{c.description}</td>
                <td dir="auto">{c.rawSubject}</td>
                <td>
                  {c.amount == null ? (
                    <span className="link-state missing">ללא סכום</span>
                  ) : c.isDuplicate ? (
                    <span className="status-badge">חשוד ככפילות</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
