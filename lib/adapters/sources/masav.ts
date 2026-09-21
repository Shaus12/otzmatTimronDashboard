import { createMockAdapter } from "../mock";
import type { PaymentBatchRow } from "../types";

export const masavAdapter = createMockAdapter<PaymentBatchRow>({
  id: "masav",
  name: "מס״ב",
  category: "finance",
  lastSynced: "2026-09-19T07:00:00.000Z",
  message: "אצוות תשלום מס״ב מדומות",
  rows: [
    {
      id: "ms-1",
      batchId: "MSB-9921",
      amount: 84200,
      payees: 14,
      status: "completed",
      date: "2026-09-01",
    },
    {
      id: "ms-2",
      batchId: "MSB-9980",
      amount: 86150,
      payees: 14,
      status: "scheduled",
      date: "2026-10-01",
    },
  ],
});
