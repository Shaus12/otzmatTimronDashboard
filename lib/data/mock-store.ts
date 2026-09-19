import { getSystemCatalog } from "./system-catalog";
import type {
  DataStore,
  EmployeeInput,
  ExpenseInput,
  FineInput,
  InvoiceInput,
  LegalCaseInput,
  PaymentInput,
  PropertyInput,
  SystemInput,
  TaskInput,
  VehicleInput,
} from "./store";
import type {
  AuditLog,
  Employee,
  Expense,
  Fine,
  HomeKpis,
  Invoice,
  LegalCase,
  Payment,
  ProfileOption,
  Property,
  System,
  Task,
  Vehicle,
  VehicleAssignment,
} from "./types";

const STAMP = "2026-09-15T10:00:00.000Z";

const systems: System[] = getSystemCatalog();

const profiles: ProfileOption[] = [
  { id: "profile-demo-01", fullName: "נועם דמו" },
  { id: "profile-demo-02", fullName: "מיה דמו" },
  { id: "profile-demo-03", fullName: "עו״ד דמו כהן" },
];

const employees: Employee[] = [
  {
    id: "emp-demo-01",
    fullName: "נועם דמו",
    email: "noam.demo@example.test",
    jobTitle: "מנהל תפעול",
    phone: "050-000-1001",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-02",
    fullName: "מיה דמו",
    email: "maya.demo@example.test",
    jobTitle: "מנהלת כספים",
    phone: "050-000-1002",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-03",
    fullName: "אורן דמו",
    email: "oren.demo@example.test",
    jobTitle: "נהג ומחסנאי",
    phone: "050-000-1003",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-04",
    fullName: "דניאל דמו",
    email: "daniel.demo@example.test",
    jobTitle: "רכזת משרד",
    phone: "050-000-1004",
    status: "on_leave",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const vehicles: Vehicle[] = [
  {
    id: "veh-demo-01",
    plate: "00-000-01",
    make: "טויוטה",
    model: "קורולה",
    year: 2022,
    notes: "היברידית",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-02",
    plate: "00-000-02",
    make: "פורד",
    model: "טרנזיט",
    year: 2021,
    notes: "מסחרית",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-03",
    plate: "00-000-03",
    make: "יונדאי",
    model: "איוניק",
    year: 2023,
    notes: "ליסינג",
    status: "in_service",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-04",
    plate: "00-000-04",
    make: "סקודה",
    model: "אוקטביה",
    year: 2020,
    notes: "פרטית",
    status: "active",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const assignments: VehicleAssignment[] = [
  {
    id: "asg-demo-01",
    vehicleId: "veh-demo-01",
    employeeId: "emp-demo-01",
    startDate: "2025-01-10",
    endDate: null,
    createdAt: STAMP,
  },
  {
    id: "asg-demo-02",
    vehicleId: "veh-demo-02",
    employeeId: "emp-demo-03",
    startDate: "2025-03-01",
    endDate: null,
    createdAt: STAMP,
  },
  {
    id: "asg-demo-03",
    vehicleId: "veh-demo-04",
    employeeId: "emp-demo-02",
    startDate: "2024-06-15",
    endDate: "2025-12-01",
    createdAt: STAMP,
  },
  {
    id: "asg-demo-04",
    vehicleId: "veh-demo-04",
    employeeId: "emp-demo-02",
    startDate: "2025-12-01",
    endDate: null,
    createdAt: STAMP,
  },
  {
    id: "asg-demo-05",
    vehicleId: "veh-demo-03",
    employeeId: "emp-demo-01",
    startDate: "2024-02-01",
    endDate: "2025-01-09",
    createdAt: STAMP,
  },
];

const fines: Fine[] = [
  {
    id: "fine-demo-01",
    title: "כביש 6 · אוגוסט (דמו)",
    description: "חיוב לבדיקה מול רכב 00-000-02",
    amount: 842,
    status: "in_progress",
    dueDate: "2026-09-18",
    vehicleId: "veh-demo-02",
    employeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-02",
    title: "אגרת רישוי · רכב 00-000-03",
    description: "תשלום נדרש לפני חידוש הטסט",
    amount: 1260,
    status: "open",
    dueDate: "2026-10-26",
    vehicleId: "veh-demo-03",
    employeeId: "emp-demo-01",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-03",
    title: "דו״ח חניה · מרכז (דמו)",
    description: "בדיקת אפשרות לביטול",
    amount: 480,
    status: "appealed",
    dueDate: "2026-09-24",
    vehicleId: null,
    employeeId: null,
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-04",
    title: "קנס עירוני · מחסן (דמו)",
    description: "מסמך תשלום התקבל",
    amount: 3080,
    status: "paid",
    dueDate: "2026-09-06",
    vehicleId: null,
    employeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const legalCases: LegalCase[] = [
  {
    id: "legal-demo-01",
    title: "תיק ספקים (דמו)",
    description: "מחלוקת מסחרית · מסמך תגובה ממתין",
    caseNumber: "DEMO-24-1187",
    status: "in_progress",
    dueDate: "2026-09-19",
    assignedTo: "profile-demo-03",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "legal-demo-02",
    title: "חוזה שכירות (דמו)",
    description: "בדיקת סעיף הצמדה וחידוש",
    caseNumber: "DEMO-24-0921",
    status: "open",
    dueDate: "2026-10-01",
    assignedTo: "profile-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "legal-demo-03",
    title: "תביעה קטנה (דמו)",
    description: "דיון נקבע לחודש הבא",
    caseNumber: "DEMO-25-0440",
    status: "in_progress",
    dueDate: "2026-10-21",
    assignedTo: "profile-demo-03",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const properties: Property[] = [
  {
    id: "prop-demo-01",
    name: "משרד ראשי · ראשון לציון (דמו)",
    address: "רחוב דמו 10, ראשון לציון",
    details: "קומה 3 · 420 מ״ר · חוזה עד 2028",
    status: "active",
    contactName: "מיה דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "prop-demo-02",
    name: "מחסן תפעולי · חולון (דמו)",
    address: "אזור התעשייה, חולון",
    details: "680 מ״ר · בדיקת כיבוי אש",
    status: "in_progress",
    contactName: "נועם דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "prop-demo-03",
    name: "דירה להשכרה · פתח תקווה (דמו)",
    address: "רחוב דמו 5, פתח תקווה",
    details: "השקעה · 4 חדרים · חידוש חוזה קרוב",
    status: "active",
    contactName: "מיה דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const tasks: Task[] = [
  {
    id: "task-demo-01",
    title: "הסדרת גישה לווטסאפ",
    description: "לבדוק הרשאות ולחבר את חשבון החברה.",
    status: "open",
    dueDate: null,
    assignedTo: "emp-demo-04",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-02",
    title: "הסדרת גישה למייל Office",
    description: "לקבל גישה לתיבת הדואר של המשרד.",
    status: "open",
    dueDate: null,
    assignedTo: "emp-demo-04",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-03",
    title: "הוספת טבלת החשבוניות",
    description: "לאתר את הטבלה ולהוסיף את הקישור במרכז המערכות.",
    status: "open",
    dueDate: null,
    assignedTo: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-04",
    title: "סגירת שכר ספטמבר",
    description: "אישור שעות חריגות והעברת הקובץ לשכר.",
    status: "done",
    dueDate: "2026-09-04",
    assignedTo: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-05",
    title: "בדיקת חיובי כביש 6",
    description: "השוואת חשבוניות מול רשימת הרכבים.",
    status: "done",
    dueDate: "2026-09-08",
    assignedTo: "emp-demo-01",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-06",
    title: "מעקב אחרי תיק ספקים",
    description: "איסוף מסמך נוסף והעברה לעורך הדין.",
    status: "in_progress",
    dueDate: "2026-09-19",
    assignedTo: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const expenses: Expense[] = [
  {
    id: "exp-demo-01",
    category: "fuel",
    amount: 620,
    vehicleId: "veh-demo-02",
    description: "תדלוק · טרנזיט (דמו)",
    vendor: "פז",
    employeeId: "emp-demo-03",
    status: "paid",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "exp-demo-02",
    category: "tolls",
    amount: 310,
    vehicleId: "veh-demo-01",
    description: "כביש 6 · ספטמבר (דמו)",
    vendor: "כביש 6",
    employeeId: "emp-demo-01",
    status: "open",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const invoices: Invoice[] = [
  {
    id: "inv-demo-01",
    status: "sent",
    amount: 4800,
    dueDate: "2026-09-30",
    clientName: "ספק דמו א׳",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "inv-demo-02",
    status: "paid",
    amount: 920,
    dueDate: "2026-09-01",
    clientName: "ספק דמו ב׳",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const payments: Payment[] = [
  {
    id: "pay-demo-01",
    amount: 920,
    invoiceId: "inv-demo-02",
    paidAt: "2026-08-28",
    method: "transfer",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "pay-demo-02",
    amount: 4800,
    invoiceId: "inv-demo-01",
    paidAt: null,
    method: "transfer",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const auditLogs: AuditLog[] = [
  {
    id: "audit-demo-01",
    entityType: "vehicle",
    entityId: "veh-demo-04",
    action: "assign",
    summary: "שיוך רכב 00-000-04 למיה דמו",
    actorName: "מערכת דמו",
    createdAt: "2025-12-01T09:00:00.000Z",
  },
  {
    id: "audit-demo-02",
    entityType: "task",
    entityId: "task-demo-04",
    action: "status_change",
    summary: "משימת סגירת שכר סומנה כהושלמה",
    actorName: "מיה דמו",
    createdAt: "2026-09-04T14:00:00.000Z",
  },
];

function byId<T extends { id: string }>(rows: T[], id: string): T | null {
  return rows.find((r) => r.id === id) ?? null;
}

export class MockDataStore implements DataStore {
  async getProfiles(): Promise<ProfileOption[]> {
    return [...profiles];
  }

  async getEmployees(): Promise<Employee[]> {
    return [...employees];
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return byId(employees, id);
  }

  async createEmployee(input: EmployeeInput): Promise<Employee> {
    const now = new Date().toISOString();
    const row: Employee = {
      ...input,
      id: `emp-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    employees.push(row);
    return row;
  }

  async updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error("Employee not found");
    employees[idx] = {
      ...employees[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return employees[idx];
  }

  async deleteEmployee(id: string): Promise<void> {
    const idx = employees.findIndex((e) => e.id === id);
    if (idx >= 0) employees.splice(idx, 1);
  }

  async getVehicles(): Promise<Vehicle[]> {
    return [...vehicles];
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return byId(vehicles, id);
  }

  async createVehicle(input: VehicleInput): Promise<Vehicle> {
    const now = new Date().toISOString();
    const row: Vehicle = {
      ...input,
      id: `veh-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    vehicles.push(row);
    return row;
  }

  async updateVehicle(id: string, input: VehicleInput): Promise<Vehicle> {
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx < 0) throw new Error("Vehicle not found");
    vehicles[idx] = {
      ...vehicles[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return vehicles[idx];
  }

  async deleteVehicle(id: string): Promise<void> {
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx >= 0) vehicles.splice(idx, 1);
  }

  async getVehicleAssignments(vehicleId?: string): Promise<VehicleAssignment[]> {
    const rows = vehicleId
      ? assignments.filter((a) => a.vehicleId === vehicleId)
      : assignments;
    return [...rows].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  async getCurrentVehicleAssignment(
    vehicleId: string,
  ): Promise<VehicleAssignment | null> {
    return (
      assignments.find((a) => a.vehicleId === vehicleId && a.endDate === null) ??
      null
    );
  }

  async setVehicleAssignment(
    vehicleId: string,
    employeeId: string | null,
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    for (const a of assignments) {
      if (a.vehicleId === vehicleId && a.endDate === null) {
        a.endDate = today;
      }
    }
    if (employeeId) {
      assignments.push({
        id: `asg-${crypto.randomUUID()}`,
        vehicleId,
        employeeId,
        startDate: today,
        endDate: null,
        createdAt: new Date().toISOString(),
      });
    }
  }

  async getFines(): Promise<Fine[]> {
    return [...fines];
  }

  async getFine(id: string): Promise<Fine | null> {
    return byId(fines, id);
  }

  async createFine(input: FineInput): Promise<Fine> {
    const now = new Date().toISOString();
    const row: Fine = {
      ...input,
      id: `fine-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    fines.push(row);
    return row;
  }

  async updateFine(id: string, input: FineInput): Promise<Fine> {
    const idx = fines.findIndex((f) => f.id === id);
    if (idx < 0) throw new Error("Fine not found");
    fines[idx] = {
      ...fines[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return fines[idx];
  }

  async deleteFine(id: string): Promise<void> {
    const idx = fines.findIndex((f) => f.id === id);
    if (idx >= 0) fines.splice(idx, 1);
  }

  async getLegalCases(): Promise<LegalCase[]> {
    return [...legalCases];
  }

  async getLegalCase(id: string): Promise<LegalCase | null> {
    return byId(legalCases, id);
  }

  async createLegalCase(input: LegalCaseInput): Promise<LegalCase> {
    const now = new Date().toISOString();
    const row: LegalCase = {
      ...input,
      id: `legal-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    legalCases.push(row);
    return row;
  }

  async updateLegalCase(id: string, input: LegalCaseInput): Promise<LegalCase> {
    const idx = legalCases.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error("Legal case not found");
    legalCases[idx] = {
      ...legalCases[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return legalCases[idx];
  }

  async deleteLegalCase(id: string): Promise<void> {
    const idx = legalCases.findIndex((c) => c.id === id);
    if (idx >= 0) legalCases.splice(idx, 1);
  }

  async getProperties(): Promise<Property[]> {
    return [...properties];
  }

  async getProperty(id: string): Promise<Property | null> {
    return byId(properties, id);
  }

  async createProperty(input: PropertyInput): Promise<Property> {
    const now = new Date().toISOString();
    const row: Property = {
      ...input,
      id: `prop-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    properties.push(row);
    return row;
  }

  async updateProperty(id: string, input: PropertyInput): Promise<Property> {
    const idx = properties.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Property not found");
    properties[idx] = {
      ...properties[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return properties[idx];
  }

  async deleteProperty(id: string): Promise<void> {
    const idx = properties.findIndex((p) => p.id === id);
    if (idx >= 0) properties.splice(idx, 1);
  }

  async getTasks(): Promise<Task[]> {
    return [...tasks];
  }

  async getTask(id: string): Promise<Task | null> {
    return byId(tasks, id);
  }

  async createTask(input: TaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const row: Task = {
      ...input,
      id: `task-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(row);
    return row;
  }

  async updateTask(id: string, input: TaskInput): Promise<Task> {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error("Task not found");
    tasks[idx] = {
      ...tasks[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return tasks[idx];
  }

  async deleteTask(id: string): Promise<void> {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx >= 0) tasks.splice(idx, 1);
  }

  async getSystems(): Promise<System[]> {
    return [...systems];
  }

  async getSystem(id: string): Promise<System | null> {
    return byId(systems, id);
  }

  async createSystem(input: SystemInput): Promise<System> {
    const now = new Date().toISOString();
    const row: System = {
      ...input,
      id:
        input.name.toLowerCase().replace(/\s+/g, "-") ||
        `sys-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    systems.push(row);
    return row;
  }

  async updateSystem(id: string, input: SystemInput): Promise<System> {
    const idx = systems.findIndex((s) => s.id === id);
    if (idx < 0) throw new Error("System not found");
    systems[idx] = {
      ...systems[idx],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };
    return systems[idx];
  }

  async deleteSystem(id: string): Promise<void> {
    const idx = systems.findIndex((s) => s.id === id);
    if (idx >= 0) systems.splice(idx, 1);
  }

  async getExpenses(): Promise<Expense[]> {
    return [...expenses];
  }

  async createExpense(input: ExpenseInput): Promise<Expense> {
    const now = new Date().toISOString();
    const row: Expense = {
      ...input,
      id: `exp-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    expenses.push(row);
    return row;
  }

  async updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error("Expense not found");
    expenses[idx] = {
      ...expenses[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return expenses[idx];
  }

  async deleteExpense(id: string): Promise<void> {
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx >= 0) expenses.splice(idx, 1);
  }

  async getInvoices(): Promise<Invoice[]> {
    return [...invoices];
  }

  async createInvoice(input: InvoiceInput): Promise<Invoice> {
    const now = new Date().toISOString();
    const row: Invoice = {
      ...input,
      id: `inv-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    invoices.push(row);
    return row;
  }

  async updateInvoice(id: string, input: InvoiceInput): Promise<Invoice> {
    const idx = invoices.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Invoice not found");
    invoices[idx] = {
      ...invoices[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return invoices[idx];
  }

  async deleteInvoice(id: string): Promise<void> {
    const idx = invoices.findIndex((i) => i.id === id);
    if (idx >= 0) invoices.splice(idx, 1);
  }

  async getPayments(): Promise<Payment[]> {
    return [...payments];
  }

  async createPayment(input: PaymentInput): Promise<Payment> {
    const now = new Date().toISOString();
    const row: Payment = {
      ...input,
      id: `pay-${crypto.randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    };
    payments.push(row);
    return row;
  }

  async updatePayment(id: string, input: PaymentInput): Promise<Payment> {
    const idx = payments.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("Payment not found");
    payments[idx] = {
      ...payments[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return payments[idx];
  }

  async deletePayment(id: string): Promise<void> {
    const idx = payments.findIndex((p) => p.id === id);
    if (idx >= 0) payments.splice(idx, 1);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...auditLogs];
  }

  async getHomeKpis(): Promise<HomeKpis> {
    const currentAssignments = assignments.filter((a) => a.endDate === null);
    return {
      systemCount: systems.length,
      systemsWithUrl: systems.filter((s) => s.url).length,
      employeeCount: employees.length,
      vehicleCount: vehicles.length,
      assignedVehicleCount: new Set(currentAssignments.map((a) => a.vehicleId))
        .size,
      openTaskCount: tasks.filter((t) => t.status !== "done").length,
      openFineCount: fines.filter((f) => f.status !== "paid").length,
    };
  }
}
