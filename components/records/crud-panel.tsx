"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus, Trash2, LoaderCircle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toUserFacingError } from "@/lib/errors";

type CrudPanelProps<T extends { id: string }> = {
  canWrite: boolean;
  addLabel: string;
  rows: T[];
  renderForm: (args: {
    draft: T | null;
    setDraft: (value: T | null) => void;
    busy: boolean;
  }) => ReactNode;
  emptyDraft: () => T;
  onSave: (draft: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  children: (args: {
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    canWrite: boolean;
  }) => ReactNode;
};

export function CrudPanel<T extends { id: string; name?: string; title?: string; fullName?: string }>({
  canWrite,
  addLabel,
  rows,
  renderForm,
  emptyDraft,
  onSave,
  onDelete,
  children,
}: CrudPanelProps<T>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [remove, setRemove] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      await onSave(draft);
      setDraft(null);
    } catch (e) {
      setError(toUserFacingError(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!remove) return;
    setBusy(true);
    setError("");
    try {
      await onDelete(remove.id);
      setRemove(null);
    } catch (e) {
      setError(toUserFacingError(e));
    } finally {
      setBusy(false);
    }
  }

  const title =
    remove?.fullName || remove?.title || remove?.name || "הרשומה";

  return (
    <>
      {canWrite ? (
        <div className="toolbar-actions">
          <Button
            className="primary-action"
            type="button"
            onClick={() => {
              setError("");
              setDraft(emptyDraft());
            }}
          >
            <Plus size={17} />
            {addLabel}
          </Button>
        </div>
      ) : null}

      {children({
        canWrite,
        onEdit: (row) => {
          setError("");
          setDraft({ ...row });
        },
        onDelete: (row) => {
          setError("");
          setRemove(row);
        },
      })}

      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open && !busy) setDraft(null);
        }}
      >
        <DialogContent dir="rtl" className="record-dialog">
          <DialogHeader>
            <DialogTitle>
              {draft && rows.some((r) => r.id === draft.id)
                ? "עריכת רשומה"
                : addLabel}
            </DialogTitle>
            <DialogDescription>
              הפרטים יישמרו בהתאם להרשאות המשתמש.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <form onSubmit={save} className="record-form">
              {renderForm({ draft, setDraft, busy })}
              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="form-actions">
                <Button disabled={busy} type="submit">
                  {busy ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}
                  שמירה
                </Button>
                <Button
                  disabled={busy}
                  type="button"
                  variant="outline"
                  onClick={() => setDraft(null)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!remove}
        onOpenChange={(open) => {
          if (!open && !busy) setRemove(null);
        }}
      >
        <DialogContent dir="rtl" className="record-dialog">
          <DialogHeader>
            <DialogTitle>למחוק את ״{title}״?</DialogTitle>
            <DialogDescription>
              הרשומה תסומן כמחוקה ולא תופיע ברשימות.
            </DialogDescription>
          </DialogHeader>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-actions">
            <Button
              variant="destructive"
              disabled={busy}
              onClick={confirmDelete}
            >
              {busy ? "מוחק…" : "מחיקה"}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setRemove(null)}
            >
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RowActions({
  canWrite,
  onEdit,
  onDelete,
  label,
}: {
  canWrite: boolean;
  onEdit: () => void;
  onDelete: () => void;
  label: string;
}) {
  if (!canWrite) return null;
  return (
    <div className="row-actions">
      <button
        type="button"
        className="icon-button"
        aria-label={`עריכת ${label}`}
        onClick={onEdit}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        className="icon-button delete"
        aria-label={`מחיקת ${label}`}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
