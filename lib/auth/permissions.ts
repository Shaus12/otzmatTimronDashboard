import type { AppRole } from "@/lib/data/types";

export type WritableEntity =
  | "employees"
  | "vehicles"
  | "fines"
  | "legal"
  | "properties"
  | "tasks"
  | "systems"
  | "expenses"
  | "invoices"
  | "payments";

const writeMatrix: Record<AppRole, ReadonlySet<WritableEntity>> = {
  admin: new Set([
    "employees",
    "vehicles",
    "fines",
    "legal",
    "properties",
    "tasks",
    "systems",
    "expenses",
    "invoices",
    "payments",
  ]),
  operations: new Set([
    "employees",
    "vehicles",
    "fines",
    "legal",
    "properties",
    "tasks",
    "systems",
  ]),
  accounting: new Set([
    "fines",
    "expenses",
    "invoices",
    "payments",
    "tasks",
  ]),
  viewer: new Set(),
};

export function canWrite(role: AppRole | null | undefined, entity: WritableEntity): boolean {
  if (!role) return false;
  return writeMatrix[role].has(entity);
}

export function canMutate(role: AppRole | null | undefined): boolean {
  if (!role) return false;
  return role !== "viewer";
}

export const roleLabels: Record<AppRole, string> = {
  admin: "מנהל",
  operations: "תפעול",
  accounting: "הנהלת חשבונות",
  viewer: "צפייה",
};
