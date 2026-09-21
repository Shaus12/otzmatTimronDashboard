import { createMockAdapter } from "../mock";
import type { TaxFormRow } from "../types";

export const taxAuthorityAdapter = createMockAdapter<TaxFormRow>({
  id: "tax_authority",
  name: "רשות המסים",
  category: "finance",
  lastSynced: "2026-09-17T09:30:00.000Z",
  message: "דיווחים מדומים לרשות המסים",
  rows: [
    {
      id: "tx-1",
      form: "מע״מ",
      period: "08/2026",
      status: "submitted",
      dueDate: "2026-09-15",
    },
    {
      id: "tx-2",
      form: "ניכויים",
      period: "08/2026",
      status: "open",
      dueDate: "2026-09-20",
    },
  ],
});
