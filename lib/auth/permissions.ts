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
  | "payments"
  | "attendance"
  | "clients"
  | "projects";

/**
 * UI + server-action write gate. Must stay aligned with Postgres RLS.
 * legal / properties / tasks / systems / clients / projects: admin only.
 * employees / vehicles / fines / attendance: admin + operations.
 * accounting: finance entities when those screens exist (not fines).
 */
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
    "attendance",
    "clients",
    "projects",
  ]),
  operations: new Set(["employees", "vehicles", "fines", "attendance"]),
  accounting: new Set(["expenses", "invoices", "payments"]),
  viewer: new Set(),
};

export function canWrite(
  role: AppRole | null | undefined,
  entity: WritableEntity,
): boolean {
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
