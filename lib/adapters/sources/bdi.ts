import { createMockAdapter } from "../mock";
import type { CreditCheckRow } from "../types";

export const bdiAdapter = createMockAdapter<CreditCheckRow>({
  id: "bdi",
  name: "BDI",
  category: "finance",
  lastSynced: "2026-09-16T11:00:00.000Z",
  message: "דוחות אשראי מדומים",
  rows: [
    {
      id: "bdi-1",
      company: "ספק דמו א׳ בע״מ",
      score: 78,
      checkedAt: "2026-09-10T10:00:00.000Z",
    },
    {
      id: "bdi-2",
      company: "לקוח דמו ג׳ בע״מ",
      score: 91,
      checkedAt: "2026-09-05T13:30:00.000Z",
    },
  ],
});
