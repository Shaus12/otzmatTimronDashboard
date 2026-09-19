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
  | "other";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: string | null;
  clientName: string;
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
