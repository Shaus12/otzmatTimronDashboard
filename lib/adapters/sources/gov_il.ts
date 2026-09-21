import { createMockAdapter } from "../mock";
import type { TicketRow } from "../types";

export const govIlAdapter = createMockAdapter<TicketRow>({
  id: "gov_il",
  name: "האזור האישי הממשלתי",
  category: "fleet",
  lastSynced: "2026-09-19T20:00:00.000Z",
  message: "דוחות ממשלתיים מדומים",
  rows: [
    {
      id: "gv-1",
      ticket: "GOV-77821",
      amount: 250,
      status: "open",
      dueDate: "2026-10-05",
    },
    {
      id: "gv-2",
      ticket: "GOV-76510",
      amount: 500,
      status: "paid",
      dueDate: "2026-09-01",
    },
  ],
});
