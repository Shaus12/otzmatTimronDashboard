import { createMockAdapter } from "../mock";
import type { ExpenseLikeRow } from "../types";
import type { SourceAdapter } from "../types";
import { readGmailSnapshot } from "@/lib/integrations/gmail-snapshot";

const mockAdapter = createMockAdapter<ExpenseLikeRow>({
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

export const gmailAdapter: SourceAdapter<ExpenseLikeRow> = {
  ...mockAdapter,
  async checkStatus() {
    const result = await readGmailSnapshot();
    if (result.state === "error") return { state: "error", message: "קובץ הדואר המקומי אינו תקין" };
    if (result.snapshot) return { state: "imported", lastSynced: result.snapshot.capturedAt,
      message: "מדגם חשבוניות ותזכורות מהמייל · ייבוא חד־פעמי" };
    return mockAdapter.checkStatus();
  },
  async fetchData() {
    const result = await readGmailSnapshot();
    if (result.snapshot) return result.snapshot.records.filter(row => row.kind === "invoice" && row.amount !== null)
      .map(row => ({ id: row.id, subject: row.subject, vendor: row.vendor, amount: row.amount as number, receivedAt: row.date }));
    if (result.state === "error") return [];
    return mockAdapter.fetchData();
  },
};
