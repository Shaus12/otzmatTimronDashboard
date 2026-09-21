import { createMockAdapter } from "../mock";
import type { MessageRow } from "../types";

export const whatsappAdapter = createMockAdapter<MessageRow>({
  id: "whatsapp",
  name: "WhatsApp",
  category: "comms",
  lastSynced: "2026-09-20T09:00:00.000Z",
  message: "שיחות מדומות — אין חיבור לחשבון החברה",
  rows: [
    {
      id: "wa-1",
      contact: "נועם דמו",
      preview: "הרכב בטיפול עד מחר בצהריים",
      at: "2026-09-20T08:44:00.000Z",
    },
    {
      id: "wa-2",
      contact: "מיה דמו",
      preview: "שלחתי את הקבלה במייל",
      at: "2026-09-19T17:12:00.000Z",
    },
  ],
});
