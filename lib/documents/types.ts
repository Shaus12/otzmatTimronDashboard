import type { WritableEntity } from "@/lib/auth/permissions";
import { canWrite } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/data/types";

/** Values allowed by documents.entity_type check constraint. */
export const DOCUMENT_ENTITY_TYPES = [
  "legal_case",
  "expense",
  "vehicle",
  "employee",
  "fine",
  "invoice",
] as const;

export type DocumentEntityType = (typeof DOCUMENT_ENTITY_TYPES)[number];

export type DocumentRecord = {
  id: string;
  entityType: DocumentEntityType;
  entityId: string;
  fileName: string;
  storagePath: string;
  uploadedBy: string | null;
  createdAt: string;
};

/** Document + freshly minted signed download URL (not persisted). */
export type DocumentWithUrl = DocumentRecord & {
  downloadUrl: string | null;
};

const ENTITY_WRITE_MAP: Record<DocumentEntityType, WritableEntity> = {
  legal_case: "legal",
  expense: "expenses",
  vehicle: "vehicles",
  employee: "employees",
  fine: "fines",
  invoice: "invoices",
};

export function isDocumentEntityType(value: string): value is DocumentEntityType {
  return (DOCUMENT_ENTITY_TYPES as readonly string[]).includes(value);
}

export function canWriteDocuments(
  role: AppRole | null | undefined,
  entityType: DocumentEntityType,
): boolean {
  return canWrite(role, ENTITY_WRITE_MAP[entityType]);
}

export function writableEntityForDocuments(
  entityType: DocumentEntityType,
): WritableEntity {
  return ENTITY_WRITE_MAP[entityType];
}

/** Display name: strip path separators only; keep original script (e.g. Hebrew). */
export function sanitizeFileName(name: string): string {
  const base = name.replace(/[/\\]/g, "_").trim() || "file";
  return base.slice(0, 180);
}

/**
 * Storage object keys must be ASCII-safe — Supabase rejects non-ASCII ("Invalid key").
 * Keep a readable ASCII stem + extension when possible; otherwise fall back to "file".
 */
export function storageObjectFileName(name: string): string {
  const base = sanitizeFileName(name);
  const dot = base.lastIndexOf(".");
  const rawStem = dot > 0 ? base.slice(0, dot) : base;
  const rawExt = dot > 0 ? base.slice(dot + 1) : "";
  const stem =
    rawStem
      .normalize("NFKD")
      .replace(/[^\x20-\x7E]/g, "") // drop non-ASCII
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || "file";
  const ext = rawExt
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 16);
  return ext ? `${stem}.${ext}` : stem;
}

export function buildStoragePath(
  entityType: DocumentEntityType,
  entityId: string,
  fileName: string,
): string {
  const safe = storageObjectFileName(fileName);
  // Unique suffix avoids overwrite collisions on same display name.
  const stamp = Date.now().toString(36);
  const dot = safe.lastIndexOf(".");
  const stem = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : "";
  return `${entityType}/${entityId}/${stem}-${stamp}${ext}`;
}

export const DOCUMENTS_BUCKET = "documents";
export const SIGNED_URL_TTL_SECONDS = 60 * 30; // 30 minutes
