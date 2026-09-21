import { createMockAdapter } from "../mock";
import type { ExpenseLikeRow } from "../types";

export const gmailAdapter = createMockAdapter<ExpenseLikeRow>({
  id: "gmail",
  name: "Gmail",
  category: "comms",
  lastSynced: "2026-09-20T07:15:00.000Z",
  message: "סריקת תיבת הדואר מדומה — חשבוניות מכביש 6 וספקים",
  rows: [
    {
      id: "gm-1",
      subject: "חשבונית כביש 6 · ספטמבר",
      vendor: "כביש 6",
      amount: 312,
      receivedAt: "2026-09-18T09:12:00.000Z",
    },
    {
      id: "gm-2",
      subject: "קבלה · תדלוק פז",
      vendor: "פז",
      amount: 480,
      receivedAt: "2026-09-17T14:40:00.000Z",
    },
    {
      id: "gm-3",
      subject: "חשבונית שירותי משרד",
      vendor: "ספק משרד דמו",
      amount: 890,
      receivedAt: "2026-09-16T11:05:00.000Z",
    },
  ],
});
