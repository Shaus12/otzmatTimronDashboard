/** Shared domain types aligned to the live Supabase schema. */

export type AppRole = "admin" | "operations" | "accounting" | "viewer";

export type EmployeeStatus = "active" | "on_leave" | "inactive";
export type VehicleStatus = "active" | "in_service" | "inactive";
export type FineStatus = "open" | "in_progress" | "paid" | "appealed";
export type LegalStatus = "open" | "in_progress" | "closed";
export type PropertyStatus = "active" | "in_progress" | "inactive";
export type TaskStatus = "open" | "in_progress" | "done";
export type SystemCategory = "finance" | "hr" | "fleet" | "comms";
export type ExpenseCategory =
  | "fuel"
  | "tolls"
  | "maintenance"
  | "office"
  | "insurance"
  | "software"
  | "other";

export type ExpenseStatus =
  | "ok"
  | "needs_review"
  | "missing_document"
  | "duplicate";

/** Informational anomaly rule id; null = none. Never auto-changes status. */
export type ExpenseAnomalyFlag = "high_amount" | "unreviewed_recurring" | null;

export type InvoiceStatus = "open" | "paid" | "overdue";

/** Stored attendance row status (TimeWatch / sync). Absences may also be derived. */
export type AttendanceStatus = "present" | "late" | "absent";

export type ProjectStatus =
  | "active"
  | "on_hold"
  | "completed"
  | "inactive";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "assign"
  | "status_change";

/** Lightweight profile row for assignee pickers (legal/tasks). */
export interface ProfileOption {
  id: string;
  fullName: string;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  phone: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  notes: string;
  status: VehicleStatus;
  /** Client assignment — mutually exclusive with an open employee assignment. */
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Historical assignment. `endDate` null = current. */
export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  employeeId: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface Fine {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: FineStatus;
  dueDate: string | null;
  vehicleId: string | null;
  employeeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegalCase {
  id: string;
  title: string;
  description: string;
  caseNumber: string;
  status: LegalStatus;
  dueDate: string | null;
  /** Profile id (profiles.id). */
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Append-only note on a legal case. No edit/delete UI yet. */
export interface LegalCaseNote {
  id: string;
  legalCaseId: string;
  authorId: string | null;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  details: string;
  status: PropertyStatus;
  contactName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface System {
  id: string;
  name: string;
  description: string;
  category: SystemCategory;
  url: string | null;
  /** Stable registry id; null for custom/manual systems. */
  adapterKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  vehicleId: string | null;
  description: string;
  vendor: string;
  employeeId: string | null;
  clientId: string | null;
  projectId: string | null;
  status: ExpenseStatus;
  /** Origin of the expense row, e.g. "gmail" | "manual". */
  source: string;
  currency: string;
  /** Calendar date the expense was incurred (YYYY-MM-DD). */
  incurredOn: string | null;
  /** Stable id from source system (e.g. Gmail message id). */
  externalId: string | null;
  /** Which anomaly rule fired, if any (informational only). */
  anomalyFlag: ExpenseAnomalyFlag;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: string | null;
  /** Free-text fallback when client_id is null. */
  clientName: string;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  invoiceId: string | null;
  paidAt: string | null;
  method: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  summary: string;
  actorName: string;
  createdAt: string;
}

export interface HomeKpis {
  systemCount: number;
  systemsWithUrl: number;
  employeeCount: number;
  vehicleCount: number;
  assignedVehicleCount: number;
  openTaskCount: number;
  openFineCount: number;
}
