/** Shared domain types for the dashboard data layer. */

export type EmployeeStatus = "active" | "on_leave" | "inactive";
export type VehicleStatus = "active" | "in_service" | "inactive";
export type FineStatus = "open" | "in_progress" | "paid" | "appealed";
export type LegalStatus = "open" | "in_progress" | "closed";
export type PropertyStatus = "active" | "in_progress" | "inactive";
export type TaskStatus = "open" | "in_progress" | "done";
export type SystemCategory =
  | "finance"
  | "hr"
  | "fleet"
  | "comms";
export type ExpenseCategory =
  | "fuel"
  | "tolls"
  | "maintenance"
  | "office"
  | "other";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type PaymentStatus = "pending" | "completed" | "failed";
export type AuditAction = "create" | "update" | "delete" | "assign" | "status_change";

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  leaveUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  notes: string;
  status: VehicleStatus;
  nextServiceDue: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Historical assignment of a vehicle to an employee. `endedAt` null = current. */
export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  employeeId: string;
  startedAt: string;
  endedAt: string | null;
  note: string;
}

export interface Fine {
  id: string;
  title: string;
  description: string;
  amountIls: number;
  status: FineStatus;
  dueDate: string | null;
  vehicleId: string | null;
  assigneeEmployeeId: string | null;
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
  assigneeName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  status: PropertyStatus;
  followUpDate: string | null;
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
  assigneeEmployeeId: string | null;
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
  title: string;
  category: ExpenseCategory;
  amountIls: number;
  incurredOn: string;
  vehicleId: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  vendor: string;
  description: string;
  amountIls: number;
  status: InvoiceStatus;
  issuedOn: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  description: string;
  amountIls: number;
  status: PaymentStatus;
  paidOn: string | null;
  invoiceId: string | null;
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
