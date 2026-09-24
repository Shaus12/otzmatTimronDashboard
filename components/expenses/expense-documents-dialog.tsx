"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentUploader } from "@/components/documents/document-uploader";
import type { Expense } from "@/lib/data/types";
import {
  expenseStatusLabels,
  formatDate,
  formatMoney,
} from "@/lib/labels";

export function ExpenseDocumentsDialog({
  expense,
  open,
  onOpenChange,
  canWrite,
}: {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
}) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="expense-docs-dialog sm:max-w-lg" dir="rtl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>מסמכי הוצאה</DialogTitle>
          <DialogDescription>
            {expense.vendor || "ללא ספק"} ·{" "}
            {formatMoney(expense.amount, expense.currency || "ILS")} ·{" "}
            {formatDate(expense.incurredOn)} ·{" "}
            {expenseStatusLabels[expense.status] ?? expense.status}
          </DialogDescription>
        </DialogHeader>
        <DocumentUploader
          entityType="expense"
          entityId={expense.id}
          canWrite={canWrite}
        />
      </DialogContent>
    </Dialog>
  );
}
