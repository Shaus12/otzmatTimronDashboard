import type {
  AuditLog,
  Employee,
  Expense,
  Fine,
  HomeKpis,
  Invoice,
  LegalCase,
  Payment,
  Property,
  System,
  Task,
  Vehicle,
  VehicleAssignment,
} from "./types";

/** Read-only data access. Swap MockDataStore for a Supabase implementation later. */
export interface DataStore {
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;

  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  getVehicleAssignments(vehicleId?: string): Promise<VehicleAssignment[]>;
  getCurrentVehicleAssignment(vehicleId: string): Promise<VehicleAssignment | null>;

  getFines(): Promise<Fine[]>;
  getFine(id: string): Promise<Fine | null>;

  getLegalCases(): Promise<LegalCase[]>;
  getLegalCase(id: string): Promise<LegalCase | null>;

  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | null>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;

  getSystems(): Promise<System[]>;
  getSystem(id: string): Promise<System | null>;

  getExpenses(): Promise<Expense[]>;
  getInvoices(): Promise<Invoice[]>;
  getPayments(): Promise<Payment[]>;
  getAuditLogs(): Promise<AuditLog[]>;

  getHomeKpis(): Promise<HomeKpis>;
}
