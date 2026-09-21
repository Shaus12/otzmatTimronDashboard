import { createMockAdapter } from "../mock";
import type { PayrollRow } from "../types";

export const payrollAdapter = createMockAdapter<PayrollRow>({
  id: "payroll",
  name: "שכר עובדים",
  category: "hr",
  lastSynced: "2026-09-04T15:00:00.000Z",
  message: "תלושי שכר מדומים — חסר קישור למערכת",
  rows: [
    {
      id: "py-1",
      employeeName: "נועם דמו",
      period: "08/2026",
      netPay: 14200,
      status: "paid",
    },
    {
      id: "py-2",
      employeeName: "מיה דמו",
      period: "08/2026",
      netPay: 15850,
      status: "paid",
    },
  ],
});
