"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Trash2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteEntityDocumentAction,
  listEntityDocumentsAction,
  uploadEntityDocumentAction,
} from "@/app/(dashboard)/documents/actions";
import type {
  DocumentEntityType,
  DocumentWithUrl,
} from "@/lib/documents/types";

function formatUploadedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function DocumentUploader({
  entityType,
  entityId,
  canWrite,
}: {
  entityType: DocumentEntityType;
  entityId: string;
  canWrite: boolean;
}) {
  const [docs, setDocs] = useState<DocumentWithUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<DocumentWithUrl | null>(
    null,
  );

  const refresh = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await listEntityDocumentsAction(entityType, entityId);
      setLoading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDocs(result.documents ?? []);
    });
  }, [entityType, entityId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setInfo(null);
    const fd = new FormData();
    fd.set("entityType", entityType);
    fd.set("entityId", entityId);
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadEntityDocumentAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setInfo("המסמך הועלה");
      if (result.document) {
        setDocs((prev) => [result.document!, ...prev]);
      } else {
        refresh();
      }
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setError(null);
    setInfo(null);
    const id = pendingDelete.id;
    const result = await deleteEntityDocumentAction(id);
    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setPendingDelete(null);
    setInfo("המסמך נמחק");
  }

  return (
    <div className="document-uploader">
      <div className="document-uploader-header">
        <h3>
          <Paperclip size={16} aria-hidden />
          מסמכים מצורפים
        </h3>
        {canWrite ? (
          <label className="document-upload-label">
            <Input
              type="file"
              className="document-file-input"
              disabled={pending}
              onChange={onFileChange}
              aria-label="בחירת קובץ להעלאה"
            />
            <span className="document-upload-btn">
              {pending ? "מעלה…" : "העלאת קובץ"}
            </span>
          </label>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {info ? <p className="adapter-status-message">{info}</p> : null}

      {loading && !docs.length ? (
        <p className="document-empty">טוען מסמכים…</p>
      ) : !docs.length ? (
        <p className="document-empty">אין מסמכים מצורפים עדיין.</p>
      ) : (
        <ul className="document-list">
          {docs.map((d) => (
            <li key={d.id}>
              <div className="document-list-main">
                {d.downloadUrl ? (
                  <a
                    href={d.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-button"
                    dir="auto"
                  >
                    {d.fileName}
                  </a>
                ) : (
                  <span dir="auto">{d.fileName}</span>
                )}
                <time dateTime={d.createdAt}>
                  {formatUploadedAt(d.createdAt)}
                </time>
              </div>
              {canWrite ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="document-delete-btn"
                  disabled={pending}
                  aria-label={`מחיקת ${d.fileName}`}
                  onClick={() => {
                    setError(null);
                    setPendingDelete(d);
                  }}
                >
                  <Trash2 size={15} />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete
            ? `למחוק את ״${pendingDelete.fileName}״?`
            : "למחוק מסמך?"
        }
        description="הקובץ יימחק מהאחסון ומהרשימה. לא ניתן לשחזר."
        confirmLabel="מחיקה"
        tone="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
