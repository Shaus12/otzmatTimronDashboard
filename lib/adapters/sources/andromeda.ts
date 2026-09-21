import { createMockAdapter } from "../mock";
import type { FleetEventRow } from "../types";

export const andromedaAdapter = createMockAdapter<FleetEventRow>({
  id: "andromeda",
  name: "אנדרומדה",
  category: "fleet",
  lastSynced: "2026-09-15T10:00:00.000Z",
  message: "אירועי צי מדומים — ממתין לכתובת מערכת",
  rows: [
    {
      id: "an-1",
      plate: "00-000-03",
      event: "כניסה לטיפול תקופתי",
      at: "2026-09-14T09:00:00.000Z",
    },
    {
      id: "an-2",
      plate: "00-000-02",
      event: "עדכון קילומטראז׳",
      at: "2026-09-12T16:40:00.000Z",
    },
  ],
});
