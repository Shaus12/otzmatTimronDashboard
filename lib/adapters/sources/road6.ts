import { createMockAdapter } from "../mock";
import type { TollRow } from "../types";

export const road6Adapter = createMockAdapter<TollRow>({
  id: "road6",
  name: "כביש 6",
  category: "fleet",
  lastSynced: "2026-09-18T22:00:00.000Z",
  message: "חיובים מדומים מכביש 6",
  rows: [
    { id: "r6-1", plate: "00-000-01", amount: 84, period: "09/2026" },
    { id: "r6-2", plate: "00-000-02", amount: 126, period: "09/2026" },
    { id: "r6-3", plate: "00-000-04", amount: 62, period: "09/2026" },
  ],
});
