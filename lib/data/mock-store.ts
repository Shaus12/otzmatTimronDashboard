import { getSystemCatalog } from "./system-catalog";
import type { DataStore } from "./store";
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

const STAMP = "2026-09-15T10:00:00.000Z";

const employees: Employee[] = [
  {
    id: "emp-demo-01",
    fullName: "נועם דמו",
    role: "מנהל תפעול",
    email: "noam.demo@example.test",
    phone: "050-000-1001",
    status: "active",
    leaveUntil: null,
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-02",
    fullName: "מיה דמו",
    role: "מנהלת כספים",
    email: "maya.demo@example.test",
    phone: "050-000-1002",
    status: "active",
    leaveUntil: null,
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-03",
    fullName: "אורן דמו",
    role: "נהג ומחסנאי",
    email: "oren.demo@example.test",
    phone: "050-000-1003",
    status: "active",
    leaveUntil: null,
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "emp-demo-04",
    fullName: "דניאל דמו",
    role: "רכזת משרד",
    email: "daniel.demo@example.test",
    phone: "050-000-1004",
    status: "on_leave",
    leaveUntil: "2026-09-22",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const vehicles: Vehicle[] = [
  {
    id: "veh-demo-01",
    make: "טויוטה",
    model: "קורולה",
    plate: "00-000-01",
    year: 2022,
    notes: "היברידית · טיפול הבא בעוד 18 יום",
    status: "active",
    nextServiceDue: "2026-10-03",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-02",
    make: "פורד",
    model: "טרנזיט",
    plate: "00-000-02",
    year: 2021,
    notes: "מסחרית · ביטוח בתוקף",
    status: "active",
    nextServiceDue: "2026-11-18",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-03",
    make: "יונדאי",
    model: "איוניק",
    plate: "00-000-03",
    year: 2023,
    notes: "ליסינג · טסט בעוד 41 יום",
    status: "in_service",
    nextServiceDue: "2026-10-26",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "veh-demo-04",
    make: "סקודה",
    model: "אוקטביה",
    plate: "00-000-04",
    year: 2020,
    notes: "פרטית · ללא חריגות",
    status: "active",
    nextServiceDue: "2026-12-07",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const assignments: VehicleAssignment[] = [
  {
    id: "asg-demo-01",
    vehicleId: "veh-demo-01",
    employeeId: "emp-demo-01",
    startedAt: "2025-01-10",
    endedAt: null,
    note: "שיוך נוכחי",
  },
  {
    id: "asg-demo-02",
    vehicleId: "veh-demo-02",
    employeeId: "emp-demo-03",
    startedAt: "2025-03-01",
    endedAt: null,
    note: "שיוך נוכחי",
  },
  {
    id: "asg-demo-03",
    vehicleId: "veh-demo-04",
    employeeId: "emp-demo-02",
    startedAt: "2024-06-15",
    endedAt: "2025-12-01",
    note: "שיוך קודם",
  },
  {
    id: "asg-demo-04",
    vehicleId: "veh-demo-04",
    employeeId: "emp-demo-02",
    startedAt: "2025-12-01",
    endedAt: null,
    note: "שיוך נוכחי",
  },
  {
    id: "asg-demo-05",
    vehicleId: "veh-demo-03",
    employeeId: "emp-demo-01",
    startedAt: "2024-02-01",
    endedAt: "2025-01-09",
    note: "הוחזר לצי לפני טיפול",
  },
];

const fines: Fine[] = [
  {
    id: "fine-demo-01",
    title: "כביש 6 · אוגוסט (דמו)",
    description: "חיוב לבדיקה מול רכב 00-000-02",
    amountIls: 842,
    status: "in_progress",
    dueDate: "2026-09-18",
    vehicleId: "veh-demo-02",
    assigneeEmployeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-02",
    title: "אגרת רישוי · רכב 00-000-03",
    description: "תשלום נדרש לפני חידוש הטסט",
    amountIls: 1260,
    status: "open",
    dueDate: "2026-10-26",
    vehicleId: "veh-demo-03",
    assigneeEmployeeId: "emp-demo-01",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-03",
    title: "דו״ח חניה · מרכז (דמו)",
    description: "בדיקת אפשרות לביטול",
    amountIls: 480,
    status: "appealed",
    dueDate: "2026-09-24",
    vehicleId: null,
    assigneeEmployeeId: null,
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "fine-demo-04",
    title: "קנס עירוני · מחסן (דמו)",
    description: "מסמך תשלום התקבל",
    amountIls: 3080,
    status: "paid",
    dueDate: "2026-09-06",
    vehicleId: null,
    assigneeEmployeeId: "emp-demo-02",
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
    assigneeName: "עו״ד דמו כהן",
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
    assigneeName: "מיה דמו",
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
    assigneeName: "עו״ד דמו כהן",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const properties: Property[] = [
  {
    id: "prop-demo-01",
    name: "משרד ראשי · ראשון לציון (דמו)",
    address: "רחוב דמו 10, ראשון לציון",
    description: "קומה 3 · 420 מ״ר · חוזה עד 2028",
    status: "active",
    followUpDate: "2026-10-01",
    contactName: "מיה דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "prop-demo-02",
    name: "מחסן תפעולי · חולון (דמו)",
    address: "אזור התעשייה, חולון",
    description: "680 מ״ר · בדיקת כיבוי אש",
    status: "in_progress",
    followUpDate: "2026-09-28",
    contactName: "נועם דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "prop-demo-03",
    name: "דירה להשכרה · פתח תקווה (דמו)",
    address: "רחוב דמו 5, פתח תקווה",
    description: "השקעה · 4 חדרים · חידוש חוזה קרוב",
    status: "active",
    followUpDate: "2026-11-12",
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
    assigneeEmployeeId: "emp-demo-04",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-02",
    title: "הסדרת גישה למייל Office",
    description: "לקבל גישה לתיבת הדואר של המשרד.",
    status: "open",
    dueDate: null,
    assigneeEmployeeId: "emp-demo-04",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-03",
    title: "הוספת טבלת החשבוניות",
    description: "לאתר את הטבלה ולהוסיף את הקישור במרכז המערכות.",
    status: "open",
    dueDate: null,
    assigneeEmployeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-04",
    title: "סגירת שכר ספטמבר",
    description: "אישור שעות חריגות והעברת הקובץ לשכר.",
    status: "done",
    dueDate: "2026-09-04",
    assigneeEmployeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-05",
    title: "בדיקת חיובי כביש 6",
    description: "השוואת חשבוניות מול רשימת הרכבים.",
    status: "done",
    dueDate: "2026-09-08",
    assigneeEmployeeId: "emp-demo-01",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "task-demo-06",
    title: "מעקב אחרי תיק ספקים",
    description: "איסוף מסמך נוסף והעברה לעורך הדין.",
    status: "in_progress",
    dueDate: "2026-09-19",
    assigneeEmployeeId: "emp-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const expenses: Expense[] = [
  {
    id: "exp-demo-01",
    title: "תדלוק · טרנזיט (דמו)",
    category: "fuel",
    amountIls: 620,
    incurredOn: "2026-09-10",
    vehicleId: "veh-demo-02",
    note: "נתוני דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "exp-demo-02",
    title: "כביש 6 · ספטמבר (דמו)",
    category: "tolls",
    amountIls: 310,
    incurredOn: "2026-09-12",
    vehicleId: "veh-demo-01",
    note: "נתוני דמו",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const invoices: Invoice[] = [
  {
    id: "inv-demo-01",
    vendor: "ספק דמו א׳",
    description: "שירותי תחזוקה חודשיים",
    amountIls: 4800,
    status: "sent",
    issuedOn: "2026-09-01",
    dueDate: "2026-09-30",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "inv-demo-02",
    vendor: "ספק דמו ב׳",
    description: "ציוד משרדי",
    amountIls: 920,
    status: "paid",
    issuedOn: "2026-08-15",
    dueDate: "2026-09-01",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

const payments: Payment[] = [
  {
    id: "pay-demo-01",
    description: "תשלום חשבונית ספק דמו ב׳",
    amountIls: 920,
    status: "completed",
    paidOn: "2026-08-28",
    invoiceId: "inv-demo-02",
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "pay-demo-02",
    description: "העברה לספק דמו א׳ (ממתינה)",
    amountIls: 4800,
    status: "pending",
    paidOn: null,
    invoiceId: "inv-demo-01",
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
  async getEmployees(): Promise<Employee[]> {
    return [...employees];
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return byId(employees, id);
  }

  async getVehicles(): Promise<Vehicle[]> {
    return [...vehicles];
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    return byId(vehicles, id);
  }

  async getVehicleAssignments(vehicleId?: string): Promise<VehicleAssignment[]> {
    const rows = vehicleId
      ? assignments.filter((a) => a.vehicleId === vehicleId)
      : assignments;
    return [...rows].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async getCurrentVehicleAssignment(
    vehicleId: string,
  ): Promise<VehicleAssignment | null> {
    return (
      assignments.find((a) => a.vehicleId === vehicleId && a.endedAt === null) ??
      null
    );
  }

  async getFines(): Promise<Fine[]> {
    return [...fines];
  }

  async getFine(id: string): Promise<Fine | null> {
    return byId(fines, id);
  }

  async getLegalCases(): Promise<LegalCase[]> {
    return [...legalCases];
  }

  async getLegalCase(id: string): Promise<LegalCase | null> {
    return byId(legalCases, id);
  }

  async getProperties(): Promise<Property[]> {
    return [...properties];
  }

  async getProperty(id: string): Promise<Property | null> {
    return byId(properties, id);
  }

  async getTasks(): Promise<Task[]> {
    return [...tasks];
  }

  async getTask(id: string): Promise<Task | null> {
    return byId(tasks, id);
  }

  async getSystems(): Promise<System[]> {
    return getSystemCatalog();
  }

  async getSystem(id: string): Promise<System | null> {
    return byId(getSystemCatalog(), id);
  }

  async getExpenses(): Promise<Expense[]> {
    return [...expenses];
  }

  async getInvoices(): Promise<Invoice[]> {
    return [...invoices];
  }

  async getPayments(): Promise<Payment[]> {
    return [...payments];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...auditLogs];
  }

  async getHomeKpis(): Promise<HomeKpis> {
    const systems = getSystemCatalog();
    const currentAssignments = assignments.filter((a) => a.endedAt === null);
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
