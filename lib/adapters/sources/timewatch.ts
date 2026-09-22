import { createMockAdapter } from "../mock";
import type { AttendanceRow } from "../types";
import type { SourceAdapter } from "../types";
import { readTimewatchSnapshot } from "@/lib/integrations/timewatch-snapshot";

const mockAdapter = createMockAdapter<AttendanceRow>({
  id: "timewatch",
  name: "TimeWatch",
  category: "hr",
  lastSynced: "2026-09-20T08:05:00.000Z",
  message: "נוכחות מדומה מ־TimeWatch",
  rows: [
    {
      id: "tw-1",
      employeeName: "נועם דמו",
      date: "2026-09-19",
      clockIn: "08:02",
      clockOut: "17:10",
      hours: 8.5,
    },
    {
      id: "tw-2",
      employeeName: "מיה דמו",
      date: "2026-09-19",
      clockIn: "08:45",
      clockOut: "16:30",
      hours: 7.25,
    },
    {
      id: "tw-3",
      employeeName: "אורן דמו",
      date: "2026-09-19",
      clockIn: "07:30",
      clockOut: "16:00",
      hours: 8.0,
    },
  ],
});

export const timewatchAdapter: SourceAdapter<AttendanceRow> = {
  ...mockAdapter,
  async checkStatus() {
    const result = await readTimewatchSnapshot();
    if (result.state === "error") return { state: "error", message: "קובץ הנוכחות המקומי אינו תקין" };
    if (result.snapshot) return {
      state: "imported", lastSynced: result.snapshot.capturedAt,
      message: "סיכום נוכחות אמיתי שיובא פעם אחת · ללא סנכרון אוטומטי",
    };
    return mockAdapter.checkStatus();
  },
  async fetchData() {
    const result = await readTimewatchSnapshot();
    // A summary is not a list of employee attendance records. Never mix real and demo rows.
    if (result.state !== "unavailable") return [];
    return mockAdapter.fetchData();
  },
};
