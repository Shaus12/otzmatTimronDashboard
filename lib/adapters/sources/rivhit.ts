import { createMockAdapter } from "../mock";
import type { InvoiceLikeRow } from "../types";

export const rivhitAdapter = createMockAdapter<InvoiceLikeRow>({
  id: "rivhit",
  name: "ריווחית",
  category: "finance",
  lastSynced: "2026-09-20T05:45:00.000Z",
  message: "חשבוניות ריווחית מדומות",
  rows: [
    {
      id: "rv-1",
      client: "לקוח דמו א׳",
      amount: 12500,
      status: "sent",
      dueDate: "2026-09-30",
    },
    {
      id: "rv-2",
      client: "לקוח דמו ב׳",
      amount: 3800,
      status: "paid",
      dueDate: "2026-09-10",
    },
  ],
});
