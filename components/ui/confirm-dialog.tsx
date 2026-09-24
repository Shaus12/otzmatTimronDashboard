"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toUserFacingError } from "@/lib/errors";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** destructive = delete-style confirm button */
  tone?: "destructive" | "primary";
  /** Optional external busy (e.g. parent transition). */
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void | Promise<void>;
};

/**
 * Shared confirmation for irreversible / high-impact actions.
 * Prefer this over window.confirm().
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  tone = "destructive",
  busy: busyProp,
  error: errorProp,
  onConfirm,
}: ConfirmDialogProps) {
  const [internalBusy, setInternalBusy] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const busy = Boolean(busyProp) || internalBusy;
  const error = errorProp ?? internalError;

  async function handleConfirm() {
    setInternalError(null);
    setInternalBusy(true);
    try {
      await onConfirm();
    } catch (e) {
      setInternalError(toUserFacingError(e));
    } finally {
      setInternalBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        if (!next) setInternalError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent
        dir="rtl"
        className="record-dialog confirm-dialog"
        showCloseButton={!busy}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="confirm-dialog-description">
            {typeof description === "string" ? description : null}
          </DialogDescription>
          {typeof description !== "string" ? (
            <div className="confirm-dialog-description text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </DialogHeader>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="form-actions">
          <Button
            type="button"
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void handleConfirm();
            }}
          >
            {busy ? "מבצע…" : confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            {cancelLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
