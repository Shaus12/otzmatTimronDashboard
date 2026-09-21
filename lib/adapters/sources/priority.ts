import { createMockAdapter } from "../mock";
import type { OrderRow } from "../types";

export const priorityAdapter = createMockAdapter<OrderRow>({
  id: "priority",
  name: "Priority",
  category: "finance",
  lastSynced: "2026-09-18T12:00:00.000Z",
  message: "הזמנות Priority מדומות — חסר קישור חברה",
  rows: [
    {
      id: "pr-1",
      ref: "SO-24091",
      customer: "לקוח תפעול דמו",
      amount: 18700,
      status: "open",
    },
    {
      id: "pr-2",
      ref: "PO-11842",
      customer: "ספק ציוד דמו",
      amount: 4200,
      status: "approved",
    },
  ],
});
