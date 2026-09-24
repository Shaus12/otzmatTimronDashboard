"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addLegalCaseNoteAction } from "@/app/(dashboard)/legal/actions";
import type { LegalCaseNote } from "@/lib/data/types";

function formatNoteTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function LegalCaseNotes({
  legalCaseId,
  notes,
  canWrite,
}: {
  legalCaseId: string;
  notes: LegalCaseNote[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addLegalCaseNoteAction(legalCaseId, text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <section className="timewatch-summary legal-notes" aria-label="הערות לתיק">
      <h2>יומן הערות</h2>
      <p className="legal-notes-intro">
        רשומה כרונולוגית — הוספה בלבד, ללא עריכה או מחיקה.
      </p>

      {canWrite ? (
        <form className="legal-note-form" onSubmit={submit}>
          <label>
            הערה חדשה
            <Textarea
              rows={3}
              value={text}
              disabled={pending}
              placeholder="מה קרה / מה הצעד הבא…"
              onChange={(e) => setText(e.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" size="sm" disabled={pending || !text.trim()}>
            {pending ? "שומר…" : "הוספת הערה"}
          </Button>
        </form>
      ) : null}

      {!notes.length ? (
        <p className="legal-notes-empty">אין הערות עדיין.</p>
      ) : (
        <ol className="legal-notes-timeline">
          {notes.map((n) => (
            <li key={n.id}>
              <div className="legal-note-meta">
                <strong dir="auto">{n.authorName || "—"}</strong>
                <time dateTime={n.createdAt}>{formatNoteTime(n.createdAt)}</time>
              </div>
              <p dir="auto">{n.note}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
