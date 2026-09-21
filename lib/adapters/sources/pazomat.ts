import { createMockAdapter } from "../mock";
import type { FuelRow } from "../types";

export const pazomatAdapter = createMockAdapter<FuelRow>({
  id: "pazomat",
  name: "פזומט",
  category: "fleet",
  lastSynced: "2026-09-20T04:10:00.000Z",
  message: "תדלוקים מדומים מפזומט",
  rows: [
    {
      id: "pz-1",
      plate: "00-000-02",
      liters: 48.2,
      amount: 312,
      station: "פז חולון",
      at: "2026-09-19T18:22:00.000Z",
    },
    {
      id: "pz-2",
      plate: "00-000-01",
      liters: 35.0,
      amount: 228,
      station: "פז ראשל״צ",
      at: "2026-09-18T07:05:00.000Z",
    },
  ],
});
