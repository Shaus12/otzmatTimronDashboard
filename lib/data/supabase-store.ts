import type { SupabaseClient } from "@supabase/supabase-js";
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
import { throwDbError, toUserFacingError } from "@/lib/errors";

type Row = Record<string, unknown>;

const SOFT_DELETE_TABLES = new Set([
  "employees",
  "vehicles",
  "fines",
  "legal_cases",
  "properties",
  "tasks",
  "systems",
  "expenses",
  "payments",
]);

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) throwDbError(error);
  if (data == null) throw new Error(toUserFacingError("No data returned"));
  return data;
}

function mapEmployee(row: Row): Employee {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    jobTitle: String(row.job_title ?? ""),
    phone: String(row.phone ?? ""),
    status: row.status as Employee["status"],
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function employeeRow(input: EmployeeInput): Row {
  return {
    full_name: input.fullName,
    email: input.email,
    job_title: input.jobTitle,
    phone: input.phone,
    status: input.status,
  };
}

function mapVehicle(row: Row): Vehicle {
  return {
    id: String(row.id),
    plate: String(row.plate ?? ""),
    make: String(row.make ?? ""),
    model: String(row.model ?? ""),
    year: Number(row.year ?? 0),
    notes: String(row.notes ?? ""),
    status: row.status as Vehicle["status"],
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function vehicleRow(input: VehicleInput): Row {
  return {
    plate: input.plate,
    make: input.make,
    model: input.model,
    year: input.year,
    notes: input.notes,
    status: input.status,
  };
}

function mapAssignment(row: Row): VehicleAssignment {
  return {
    id: String(row.id),
    vehicleId: String(row.vehicle_id),
    employeeId: String(row.employee_id),
    startDate: String(row.start_date ?? ""),
    endDate: (row.end_date as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
  };
}

function mapFine(row: Row): Fine {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    amount: Number(row.amount ?? 0),
    status: row.status as Fine["status"],
    dueDate: (row.due_date as string | null) ?? null,
    vehicleId: (row.vehicle_id as string | null) ?? null,
    employeeId: (row.employee_id as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function fineRow(input: FineInput): Row {
  return {
    title: input.title,
    description: input.description,
    amount: input.amount,
    status: input.status,
    due_date: input.dueDate,
    vehicle_id: input.vehicleId,
    employee_id: input.employeeId,
  };
}

function mapLegal(row: Row): LegalCase {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    caseNumber: String(row.case_number ?? ""),
    status: row.status as LegalCase["status"],
    dueDate: (row.due_date as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function legalRow(input: LegalCaseInput): Row {
  return {
    title: input.title,
    description: input.description,
    case_number: input.caseNumber,
    status: input.status,
    due_date: input.dueDate,
    assigned_to: input.assignedTo,
  };
}

function mapProperty(row: Row): Property {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    address: String(row.address ?? ""),
    details: String(row.details ?? ""),
    status: row.status as Property["status"],
    contactName: String(row.contact_name ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function propertyRow(input: PropertyInput): Row {
  return {
    name: input.name,
    address: input.address,
    details: input.details,
    status: input.status,
    contact_name: input.contactName,
  };
}

function mapTask(row: Row): Task {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    status: row.status as Task["status"],
    dueDate: (row.due_date as string | null) ?? null,
    assignedTo: (row.assigned_to as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function taskRow(input: TaskInput): Row {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    due_date: input.dueDate,
    assigned_to: input.assignedTo,
  };
}

function mapSystem(row: Row): System {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    category: row.category as System["category"],
    url: (row.url as string | null) ?? null,
    adapterKey: (row.adapter_key as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function systemRow(input: SystemInput): Row {
  // adapter_key is seed/migration-owned — never written from CRUD.
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    url: input.url,
  };
}

function mapExpense(row: Row): Expense {
  return {
    id: String(row.id),
    category: row.category as Expense["category"],
    amount: Number(row.amount ?? 0),
    vehicleId: (row.vehicle_id as string | null) ?? null,
    description: String(row.description ?? ""),
    vendor: String(row.vendor ?? ""),
    employeeId: (row.employee_id as string | null) ?? null,
    status: String(row.status ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function expenseRow(input: ExpenseInput): Row {
  return {
    category: input.category,
    amount: input.amount,
    vehicle_id: input.vehicleId,
    description: input.description,
    vendor: input.vendor,
    employee_id: input.employeeId,
    status: input.status,
  };
}

function mapInvoice(row: Row): Invoice {
  return {
    id: String(row.id),
    status: row.status as Invoice["status"],
    amount: Number(row.amount ?? 0),
    dueDate: (row.due_date as string | null) ?? null,
    clientName: String(row.client_name ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function invoiceRow(input: InvoiceInput): Row {
  return {
    status: input.status,
    amount: input.amount,
    due_date: input.dueDate,
    client_name: input.clientName,
  };
}

function mapPayment(row: Row): Payment {
  return {
    id: String(row.id),
    amount: Number(row.amount ?? 0),
    invoiceId: (row.invoice_id as string | null) ?? null,
    paidAt: (row.paid_at as string | null) ?? null,
    method: String(row.method ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function paymentRow(input: PaymentInput): Row {
  return {
    amount: input.amount,
    invoice_id: input.invoiceId,
    paid_at: input.paidAt,
    method: input.method,
  };
}

function mapAudit(row: Row): AuditLog {
  return {
    id: String(row.id),
    entityType: String(row.entity_type ?? ""),
    entityId: String(row.entity_id ?? ""),
    action: row.action as AuditLog["action"],
    summary: String(row.summary ?? ""),
    actorName: String(row.actor_name ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export class SupabaseDataStore implements DataStore {
  constructor(private readonly supabase: SupabaseClient) {}

  private list(table: string) {
    let query = this.supabase.from(table).select("*");
    if (SOFT_DELETE_TABLES.has(table)) {
      query = query.is("deleted_at", null);
    }
    return query;
  }

  async getProfiles(): Promise<ProfileOption[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, full_name")
      .order("full_name");
    if (error) throwDbError(error);
    return (data ?? []).map((row) => ({
      id: String(row.id),
      fullName: String(row.full_name ?? ""),
    }));
  }

  private async softDelete(table: string, id: string): Promise<void> {
    if (!SOFT_DELETE_TABLES.has(table)) {
      throw new Error("לא ניתן למחוק רשומה מטבלה זו.");
    }
    const { error } = await this.supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throwDbError(error);
  }

  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await this.list("employees").order("full_name");
    if (error) throwDbError(error);
    return (data ?? []).map(mapEmployee);
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const { data, error } = await this.list("employees").eq("id", id).maybeSingle();
    if (error) throwDbError(error);
    return data ? mapEmployee(data) : null;
  }

  async createEmployee(input: EmployeeInput): Promise<Employee> {
    const { data, error } = await this.supabase
      .from("employees")
      .insert(employeeRow(input))
      .select("*")
      .single();
    return mapEmployee(requireData(data, error));
  }

  async updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
    const { data, error } = await this.supabase
      .from("employees")
      .update(employeeRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapEmployee(requireData(data, error));
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.softDelete("employees", id);
  }

  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await this.list("vehicles").order("plate");
    if (error) throwDbError(error);
    return (data ?? []).map(mapVehicle);
  }

  async getVehicle(id: string): Promise<Vehicle | null> {
    const { data, error } = await this.list("vehicles").eq("id", id).maybeSingle();
    if (error) throwDbError(error);
    return data ? mapVehicle(data) : null;
  }

  async createVehicle(input: VehicleInput): Promise<Vehicle> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .insert(vehicleRow(input))
      .select("*")
      .single();
    return mapVehicle(requireData(data, error));
  }

  async updateVehicle(id: string, input: VehicleInput): Promise<Vehicle> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .update(vehicleRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapVehicle(requireData(data, error));
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.softDelete("vehicles", id);
  }

  async getVehicleAssignments(vehicleId?: string): Promise<VehicleAssignment[]> {
    let query = this.supabase
      .from("vehicle_assignments")
      .select("*")
      .order("start_date", { ascending: false });
    if (vehicleId) query = query.eq("vehicle_id", vehicleId);
    const { data, error } = await query;
    if (error) throwDbError(error);
    return (data ?? []).map(mapAssignment);
  }

  async getCurrentVehicleAssignment(
    vehicleId: string,
  ): Promise<VehicleAssignment | null> {
    const { data, error } = await this.supabase
      .from("vehicle_assignments")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .is("end_date", null)
      .maybeSingle();
    if (error) throwDbError(error);
    return data ? mapAssignment(data) : null;
  }

  async setVehicleAssignment(
    vehicleId: string,
    employeeId: string | null,
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const { error: endError } = await this.supabase
      .from("vehicle_assignments")
      .update({ end_date: today })
      .eq("vehicle_id", vehicleId)
      .is("end_date", null);
    if (endError) throwDbError(endError);

    if (!employeeId) return;

    const { error: insertError } = await this.supabase
      .from("vehicle_assignments")
      .insert({
        vehicle_id: vehicleId,
        employee_id: employeeId,
        start_date: today,
        end_date: null,
      });
    if (insertError) throwDbError(insertError);
  }

  async getFines(): Promise<Fine[]> {
    const { data, error } = await this.list("fines").order("due_date", {
      ascending: true,
      nullsFirst: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapFine);
  }

  async getFine(id: string): Promise<Fine | null> {
    const { data, error } = await this.list("fines").eq("id", id).maybeSingle();
    if (error) throwDbError(error);
    return data ? mapFine(data) : null;
  }

  async createFine(input: FineInput): Promise<Fine> {
    const { data, error } = await this.supabase
      .from("fines")
      .insert(fineRow(input))
      .select("*")
      .single();
    return mapFine(requireData(data, error));
  }

  async updateFine(id: string, input: FineInput): Promise<Fine> {
    const { data, error } = await this.supabase
      .from("fines")
      .update(fineRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapFine(requireData(data, error));
  }

  async deleteFine(id: string): Promise<void> {
    await this.softDelete("fines", id);
  }

  async getLegalCases(): Promise<LegalCase[]> {
    const { data, error } = await this.list("legal_cases").order("due_date", {
      ascending: true,
      nullsFirst: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapLegal);
  }

  async getLegalCase(id: string): Promise<LegalCase | null> {
    const { data, error } = await this.list("legal_cases")
      .eq("id", id)
      .maybeSingle();
    if (error) throwDbError(error);
    return data ? mapLegal(data) : null;
  }

  async createLegalCase(input: LegalCaseInput): Promise<LegalCase> {
    const { data, error } = await this.supabase
      .from("legal_cases")
      .insert(legalRow(input))
      .select("*")
      .single();
    return mapLegal(requireData(data, error));
  }

  async updateLegalCase(id: string, input: LegalCaseInput): Promise<LegalCase> {
    const { data, error } = await this.supabase
      .from("legal_cases")
      .update(legalRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapLegal(requireData(data, error));
  }

  async deleteLegalCase(id: string): Promise<void> {
    await this.softDelete("legal_cases", id);
  }

  async getProperties(): Promise<Property[]> {
    const { data, error } = await this.list("properties").order("address");
    if (error) throwDbError(error);
    return (data ?? []).map(mapProperty);
  }

  async getProperty(id: string): Promise<Property | null> {
    const { data, error } = await this.list("properties")
      .eq("id", id)
      .maybeSingle();
    if (error) throwDbError(error);
    return data ? mapProperty(data) : null;
  }

  async createProperty(input: PropertyInput): Promise<Property> {
    const { data, error } = await this.supabase
      .from("properties")
      .insert(propertyRow(input))
      .select("*")
      .single();
    return mapProperty(requireData(data, error));
  }

  async updateProperty(id: string, input: PropertyInput): Promise<Property> {
    const { data, error } = await this.supabase
      .from("properties")
      .update(propertyRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapProperty(requireData(data, error));
  }

  async deleteProperty(id: string): Promise<void> {
    await this.softDelete("properties", id);
  }

  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.list("tasks").order("due_date", {
      ascending: true,
      nullsFirst: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapTask);
  }

  async getTask(id: string): Promise<Task | null> {
    const { data, error } = await this.list("tasks").eq("id", id).maybeSingle();
    if (error) throwDbError(error);
    return data ? mapTask(data) : null;
  }

  async createTask(input: TaskInput): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert(taskRow(input))
      .select("*")
      .single();
    return mapTask(requireData(data, error));
  }

  async updateTask(id: string, input: TaskInput): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update(taskRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapTask(requireData(data, error));
  }

  async deleteTask(id: string): Promise<void> {
    await this.softDelete("tasks", id);
  }

  async getSystems(): Promise<System[]> {
    const { data, error } = await this.list("systems").order("name");
    if (error) throwDbError(error);
    return (data ?? []).map(mapSystem);
  }

  async getSystem(id: string): Promise<System | null> {
    const { data, error } = await this.list("systems").eq("id", id).maybeSingle();
    if (error) throwDbError(error);
    return data ? mapSystem(data) : null;
  }

  async createSystem(input: SystemInput): Promise<System> {
    const { data, error } = await this.supabase
      .from("systems")
      .insert(systemRow(input))
      .select("*")
      .single();
    return mapSystem(requireData(data, error));
  }

  async updateSystem(id: string, input: SystemInput): Promise<System> {
    const { data, error } = await this.supabase
      .from("systems")
      .update(systemRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapSystem(requireData(data, error));
  }

  async deleteSystem(id: string): Promise<void> {
    await this.softDelete("systems", id);
  }

  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await this.list("expenses").order("created_at", {
      ascending: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapExpense);
  }

  async createExpense(input: ExpenseInput): Promise<Expense> {
    const { data, error } = await this.supabase
      .from("expenses")
      .insert(expenseRow(input))
      .select("*")
      .single();
    return mapExpense(requireData(data, error));
  }

  async updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
    const { data, error } = await this.supabase
      .from("expenses")
      .update(expenseRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapExpense(requireData(data, error));
  }

  async deleteExpense(id: string): Promise<void> {
    await this.softDelete("expenses", id);
  }

  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.list("invoices").order("created_at", {
      ascending: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapInvoice);
  }

  async createInvoice(input: InvoiceInput): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from("invoices")
      .insert(invoiceRow(input))
      .select("*")
      .single();
    return mapInvoice(requireData(data, error));
  }

  async updateInvoice(id: string, input: InvoiceInput): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from("invoices")
      .update(invoiceRow(input))
      .eq("id", id)
      .select("*")
      .single();
    return mapInvoice(requireData(data, error));
  }

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await this.supabase.from("invoices").delete().eq("id", id);
    if (error) throwDbError(error);
  }

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await this.list("payments").order("created_at", {
      ascending: false,
    });
    if (error) throwDbError(error);
    return (data ?? []).map(mapPayment);
  }

  async createPayment(input: PaymentInput): Promise<Payment> {
    const { data, error } = await this.supabase
      .from("payments")
      .insert(paymentRow(input))
      .select("*")
      .single();
    return mapPayment(requireData(data, error));
  }

  async updatePayment(id: string, input: PaymentInput): Promise<Payment> {
    const { data, error } = await this.supabase
      .from("payments")
      .update(paymentRow(input))
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    return mapPayment(requireData(data, error));
  }

  async deletePayment(id: string): Promise<void> {
    await this.softDelete("payments", id);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throwDbError(error);
    return (data ?? []).map(mapAudit);
  }

  async getHomeKpis(): Promise<HomeKpis> {
    const [systems, employees, vehicles, tasks, fines, assignments] =
      await Promise.all([
        this.getSystems(),
        this.getEmployees(),
        this.getVehicles(),
        this.getTasks(),
        this.getFines(),
        this.getVehicleAssignments(),
      ]);
    const current = assignments.filter((a) => a.endDate === null);
    return {
      systemCount: systems.length,
      systemsWithUrl: systems.filter((s) => s.url).length,
      employeeCount: employees.length,
      vehicleCount: vehicles.length,
      assignedVehicleCount: new Set(current.map((a) => a.vehicleId)).size,
      openTaskCount: tasks.filter((t) => t.status !== "done").length,
      openFineCount: fines.filter((f) => f.status !== "paid").length,
    };
  }
}
