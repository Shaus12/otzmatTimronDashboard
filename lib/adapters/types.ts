import type { SystemCategory } from "@/lib/data/types";

export type AdapterStatusState =
  | "mock"
  | "imported"
  | "connected"
  | "error"
  | "missing_access"
  | "unrecognized";

export type AdapterStatus = {
  state: AdapterStatusState;
  lastSynced?: string;
  message?: string;
  /** Connected account email when known (e.g. Gmail). */
  accountEmail?: string;
  /** Gmail only: automatic expense sync toggle. */
  gmailSyncEnabled?: boolean;
};

/** Optional context for adapters that need local roster data (e.g. TimeWatch mock). */
export type FetchDataOptions = {
  employees?: Array<{ id: string; fullName: string }>;
};

/** External-source adapter. Swap mock for a real implementation without UI changes. */
export interface SourceAdapter<T = unknown> {
  id: string;
  name: string;
  category: SystemCategory;
  checkStatus(): Promise<AdapterStatus>;
  fetchData(options?: FetchDataOptions): Promise<T[]>;
}

export type ExpenseLikeRow = {
  id: string;
  subject: string;
  vendor: string;
  amount: number;
  receivedAt: string;
};

export type MessageRow = {
  id: string;
  contact: string;
  preview: string;
  at: string;
};

export type BankTxnRow = {
  id: string;
  description: string;
  amount: number;
  balance: number;
  date: string;
};

export type InvoiceLikeRow = {
  id: string;
  client: string;
  amount: number;
  status: string;
  dueDate: string;
};

export type OrderRow = {
  id: string;
  ref: string;
  customer: string;
  amount: number;
  status: string;
};

export type TaxFormRow = {
  id: string;
  form: string;
  period: string;
  status: string;
  dueDate: string;
};

export type PaymentBatchRow = {
  id: string;
  batchId: string;
  amount: number;
  payees: number;
  status: string;
  date: string;
};

export type FuelRow = {
  id: string;
  plate: string;
  liters: number;
  amount: number;
  station: string;
  at: string;
};

export type CreditCheckRow = {
  id: string;
  company: string;
  score: number;
  checkedAt: string;
};

export type TicketRow = {
  id: string;
  ticket: string;
  amount: number;
  status: string;
  dueDate: string;
};

export type TollRow = {
  id: string;
  plate: string;
  amount: number;
  period: string;
};

export type AttendanceRow = {
  id: string;
  /** Set when generating against the live employee roster (sync path). */
  employeeId?: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  /** present | late — absences are omitted rows, detected later. */
  status: "present" | "late";
};

export type PayrollRow = {
  id: string;
  employeeName: string;
  period: string;
  netPay: number;
  status: string;
};

export type FleetEventRow = {
  id: string;
  plate: string;
  event: string;
  at: string;
};
