"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite, type WritableEntity } from "@/lib/auth/permissions";
import { getDataStore } from "@/lib/data";
import type {
  ClientInput,
  EmployeeInput,
  FineInput,
  LegalCaseInput,
  ProjectInput,
  PropertyInput,
  SystemInput,
  TaskInput,
  VehicleInput,
} from "@/lib/data/store";

async function requireWrite(entity: WritableEntity) {
  const profile = await getCurrentProfile();
  if (!profile || !canWrite(profile.role, entity)) {
    throw new Error("אין הרשאה לביצוע הפעולה");
  }
  return profile;
}

export async function saveEmployeeAction(
  id: string | null,
  input: EmployeeInput,
) {
  await requireWrite("employees");
  const store = await getDataStore();
  if (id) await store.updateEmployee(id, input);
  else await store.createEmployee(input);
  revalidatePath("/employees");
  revalidatePath("/");
}

export async function deleteEmployeeAction(id: string) {
  await requireWrite("employees");
  const store = await getDataStore();
  await store.deleteEmployee(id);
  revalidatePath("/employees");
  revalidatePath("/");
}

export async function saveVehicleAction(
  id: string | null,
  input: VehicleInput,
  assigneeEmployeeId: string | null,
  assigneeClientId: string | null = null,
) {
  await requireWrite("vehicles");
  const store = await getDataStore();

  // Mutual exclusivity: employee OR client, not both.
  const employeeId = assigneeClientId ? null : assigneeEmployeeId;
  const clientId = employeeId ? null : assigneeClientId;

  const vehicleInput: VehicleInput = { ...input, clientId };
  const vehicle = id
    ? await store.updateVehicle(id, vehicleInput)
    : await store.createVehicle(vehicleInput);
  await store.setVehicleAssignment(vehicle.id, employeeId);
  revalidatePath("/vehicles");
  revalidatePath("/employees");
  revalidatePath("/clients");
  revalidatePath("/");
}

export async function deleteVehicleAction(id: string) {
  await requireWrite("vehicles");
  const store = await getDataStore();
  await store.setVehicleAssignment(id, null);
  await store.deleteVehicle(id);
  revalidatePath("/vehicles");
  revalidatePath("/");
}

export async function saveFineAction(id: string | null, input: FineInput) {
  await requireWrite("fines");
  const store = await getDataStore();
  if (id) await store.updateFine(id, input);
  else await store.createFine(input);
  revalidatePath("/fines");
  revalidatePath("/");
}

export async function deleteFineAction(id: string) {
  await requireWrite("fines");
  const store = await getDataStore();
  await store.deleteFine(id);
  revalidatePath("/fines");
  revalidatePath("/");
}

export async function saveLegalAction(
  id: string | null,
  input: LegalCaseInput,
) {
  await requireWrite("legal");
  const store = await getDataStore();
  if (id) await store.updateLegalCase(id, input);
  else await store.createLegalCase(input);
  revalidatePath("/legal");
  revalidatePath("/");
}

export async function deleteLegalAction(id: string) {
  await requireWrite("legal");
  const store = await getDataStore();
  await store.deleteLegalCase(id);
  revalidatePath("/legal");
  revalidatePath("/");
}

export async function savePropertyAction(
  id: string | null,
  input: PropertyInput,
) {
  await requireWrite("properties");
  const store = await getDataStore();
  if (id) await store.updateProperty(id, input);
  else await store.createProperty(input);
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function deletePropertyAction(id: string) {
  await requireWrite("properties");
  const store = await getDataStore();
  await store.deleteProperty(id);
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function saveTaskAction(id: string | null, input: TaskInput) {
  await requireWrite("tasks");
  const store = await getDataStore();
  if (id) await store.updateTask(id, input);
  else await store.createTask(input);
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function deleteTaskAction(id: string) {
  await requireWrite("tasks");
  const store = await getDataStore();
  await store.deleteTask(id);
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function saveSystemAction(id: string | null, input: SystemInput) {
  await requireWrite("systems");
  const store = await getDataStore();
  if (id) await store.updateSystem(id, input);
  else await store.createSystem(input);
  revalidatePath("/systems");
  revalidatePath("/");
}

export async function deleteSystemAction(id: string) {
  await requireWrite("systems");
  const store = await getDataStore();
  await store.deleteSystem(id);
  revalidatePath("/systems");
  revalidatePath("/");
}

export async function saveClientAction(id: string | null, input: ClientInput) {
  await requireWrite("clients");
  const store = await getDataStore();
  if (id) await store.updateClient(id, input);
  else await store.createClient(input);
  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/collections");
  revalidatePath("/expenses");
  revalidatePath("/vehicles");
}

export async function deleteClientAction(id: string) {
  await requireWrite("clients");
  const store = await getDataStore();
  await store.deleteClient(id);
  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/collections");
  revalidatePath("/expenses");
  revalidatePath("/vehicles");
}

export async function saveProjectAction(
  id: string | null,
  input: ProjectInput,
) {
  await requireWrite("projects");
  const store = await getDataStore();
  if (id) await store.updateProject(id, input);
  else await store.createProject(input);
  revalidatePath("/projects");
  revalidatePath("/expenses");
}

export async function deleteProjectAction(id: string) {
  await requireWrite("projects");
  const store = await getDataStore();
  await store.deleteProject(id);
  revalidatePath("/projects");
  revalidatePath("/expenses");
}
