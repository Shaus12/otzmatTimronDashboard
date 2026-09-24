import type {
  AuditLog,
  AttendanceRecord,
  AttendanceStatus,
  Client,
  Employee,
  Expense,
  Fine,
  HomeKpis,
  Invoice,
  LegalCase,
  LegalCaseNote,
  Payment,
  ProfileOption,
  Project,
  Property,
  System,
  Task,
  Vehicle,
  VehicleAssignment,
} from "./types";

export type EmployeeInput = Omit<Employee, "id" | "createdAt" | "updatedAt">;
export type VehicleInput = Omit<Vehicle, "id" | "createdAt" | "updatedAt">;
export type FineInput = Omit<Fine, "id" | "createdAt" | "updatedAt">;
export type LegalCaseInput = Omit<LegalCase, "id" | "createdAt" | "updatedAt">;
export type LegalCaseNoteInput = {
  legalCaseId: string;
  authorId: string | null;
  note: string;
};
export type PropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt">;
export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type SystemInput = Omit<
  System,
  "id" | "createdAt" | "updatedAt" | "adapterKey"
>;
export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;
export type InvoiceInput = Omit<Invoice, "id" | "createdAt" | "updatedAt">;
export type PaymentInput = Omit<Payment, "id" | "createdAt" | "updatedAt">;
export type ClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type AttendanceRecordInput = {
  employeeId: string;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  source: string;
};

/** Read/write data access. Mock or Supabase implementations. */
export interface DataStore {
  getProfiles(): Promise<ProfileOption[]>;

  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | null>;
  createEmployee(input: EmployeeInput): Promise<Employee>;
  updateEmployee(id: string, input: EmployeeInput): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;
  createVehicle(input: VehicleInput): Promise<Vehicle>;
  updateVehicle(id: string, input: VehicleInput): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
  getVehicleAssignments(vehicleId?: string): Promise<VehicleAssignment[]>;
  getCurrentVehicleAssignment(
    vehicleId: string,
  ): Promise<VehicleAssignment | null>;
  /** Ends any current assignment, then opens a new history row when employeeId is set. */
  setVehicleAssignment(
    vehicleId: string,
    employeeId: string | null,
  ): Promise<void>;

  getFines(): Promise<Fine[]>;
  getFine(id: string): Promise<Fine | null>;
  createFine(input: FineInput): Promise<Fine>;
  updateFine(id: string, input: FineInput): Promise<Fine>;
  deleteFine(id: string): Promise<void>;

  getLegalCases(): Promise<LegalCase[]>;
  getLegalCase(id: string): Promise<LegalCase | null>;
  createLegalCase(input: LegalCaseInput): Promise<LegalCase>;
  updateLegalCase(id: string, input: LegalCaseInput): Promise<LegalCase>;
  deleteLegalCase(id: string): Promise<void>;
  getLegalCaseNotes(legalCaseId: string): Promise<LegalCaseNote[]>;
  createLegalCaseNote(input: LegalCaseNoteInput): Promise<LegalCaseNote>;

  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | null>;
  createProperty(input: PropertyInput): Promise<Property>;
  updateProperty(id: string, input: PropertyInput): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: string, input: TaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  getSystems(): Promise<System[]>;
  getSystem(id: string): Promise<System | null>;
  createSystem(input: SystemInput): Promise<System>;
  updateSystem(id: string, input: SystemInput): Promise<System>;
  deleteSystem(id: string): Promise<void>;

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  createClient(input: ClientInput): Promise<Client>;
  updateClient(id: string, input: ClientInput): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(input: ProjectInput): Promise<Project>;
  updateProject(id: string, input: ProjectInput): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  getExpenses(): Promise<Expense[]>;
  createExpense(input: ExpenseInput): Promise<Expense>;
  updateExpense(id: string, input: ExpenseInput): Promise<Expense>;
  setExpenseAnomalyFlag(
    id: string,
    anomalyFlag: Expense["anomalyFlag"],
  ): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  getInvoices(): Promise<Invoice[]>;
  createInvoice(input: InvoiceInput): Promise<Invoice>;
  updateInvoice(id: string, input: InvoiceInput): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  getPayments(): Promise<Payment[]>;
  createPayment(input: PaymentInput): Promise<Payment>;
  updatePayment(id: string, input: PaymentInput): Promise<Payment>;
  deletePayment(id: string): Promise<void>;

  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  /** Upsert by employee_id + work_date. */
  upsertAttendanceRecords(
    inputs: AttendanceRecordInput[],
  ): Promise<AttendanceRecord[]>;

  getAuditLogs(): Promise<AuditLog[]>;

  getHomeKpis(): Promise<HomeKpis>;
}
