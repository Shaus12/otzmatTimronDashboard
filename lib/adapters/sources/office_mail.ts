import { createMockAdapter } from "../mock";
import type { ExpenseLikeRow } from "../types";

export const officeMailAdapter = createMockAdapter<ExpenseLikeRow>({
  id: "office_mail",
  name: "Office Mail",
  category: "comms",
  lastSynced: "2026-09-19T16:20:00.000Z",
  message: "תיבת Outlook מדומה — ממתין להרשאת גישה אמיתית",
  rows: [
    {
      id: "om-1",
      subject: "אישור הזמנת ציוד",
      vendor: "Office Depot IL",
      amount: 640,
      receivedAt: "2026-09-19T10:00:00.000Z",
    },
    {
      id: "om-2",
      subject: "חשבונית ייעוץ משפטי",
      vendor: "משרד עו״ד דמו",
      amount: 2400,
      receivedAt: "2026-09-15T08:30:00.000Z",
    },
  ],
});
