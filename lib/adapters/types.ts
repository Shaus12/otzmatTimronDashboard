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
};

/** External-source adapter. Swap mock for a real implementation without UI changes. */
export interface SourceAdapter<T = unknown> {
  id: string;
  name: string;
  category: SystemCategory;
  checkStatus(): Promise<AdapterStatus>;
  fetchData(): Promise<T[]>;
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
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
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
