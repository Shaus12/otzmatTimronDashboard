import { createMockAdapter } from "../mock";
import type { BankTxnRow } from "../types";

export const bankLeumiAdapter = createMockAdapter<BankTxnRow>({
  id: "bank_leumi",
  name: "בנק לאומי",
  category: "finance",
  lastSynced: "2026-09-20T06:00:00.000Z",
  message: "תנועות בנק מדומות",
  rows: [
    {
      id: "bl-1",
      description: "העברה לספק דמו א׳",
      amount: -4800,
      balance: 126450,
      date: "2026-09-19",
    },
    {
      id: "bl-2",
      description: "זיכוי לקוח",
      amount: 9200,
      balance: 131250,
      date: "2026-09-18",
    },
    {
      id: "bl-3",
      description: "עמלת ניהול חשבון",
      amount: -39,
      balance: 122050,
      date: "2026-09-15",
    },
  ],
});
