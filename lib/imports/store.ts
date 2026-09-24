import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import type {
  ColumnMapping,
  ImportBatch,
  ImportMappingTemplate,
  ImportTargetTable,
} from "./types";

function mapTemplate(row: Record<string, unknown>): ImportMappingTemplate {
  return {
    id: String(row.id),
    sourceName: String(row.source_name ?? ""),
    targetTable: row.target_table as ImportTargetTable,
    columnMapping: (row.column_mapping as ColumnMapping) ?? {},
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapBatch(row: Record<string, unknown>): ImportBatch {
  const profile = row.profiles as { full_name?: string | null } | null;
  const fullName = profile?.full_name?.trim() || null;
  return {
    id: String(row.id),
    sourceName: String(row.source_name ?? ""),
    targetTable: row.target_table as ImportTargetTable,
    fileName: String(row.file_name ?? ""),
    rowCount: Number(row.row_count ?? 0),
    importedBy: (row.imported_by as string | null) ?? null,
    importerName: fullName,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function listImportTemplates(): Promise<ImportMappingTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("import_mapping_templates")
    .select("*")
    .order("source_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapTemplate(r as Record<string, unknown>));
}

export async function upsertImportTemplate(input: {
  sourceName: string;
  targetTable: ImportTargetTable;
  columnMapping: ColumnMapping;
  createdBy: string;
}): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("import_mapping_templates").upsert(
    {
      source_name: input.sourceName.trim(),
      target_table: input.targetTable,
      column_mapping: input.columnMapping,
      created_by: input.createdBy,
      updated_at: now,
    },
    { onConflict: "source_name,target_table" },
  );
  if (error) throw new Error(error.message);
}

/** Resolve display names for importers: profiles.full_name, else auth email. */
async function resolveImporterNames(
  batches: ImportBatch[],
): Promise<ImportBatch[]> {
  const missingIds = [
    ...new Set(
      batches
        .filter((b) => !b.importerName && b.importedBy)
        .map((b) => b.importedBy as string),
    ),
  ];
  if (!missingIds.length || !hasServiceRole()) return batches;

  const admin = createServiceClient();
  const emailById = new Map<string, string>();
  await Promise.all(
    missingIds.map(async (id) => {
      try {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (!error && data.user?.email) emailById.set(id, data.user.email);
      } catch {
        // Leave unnamed if auth lookup fails.
      }
    }),
  );

  return batches.map((b) => {
    if (b.importerName || !b.importedBy) return b;
    const email = emailById.get(b.importedBy);
    return email ? { ...b, importerName: email } : b;
  });
}

export async function listImportBatches(limit = 40): Promise<ImportBatch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("import_batches")
    .select("*, profiles:imported_by ( full_name )")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  const batches = (data ?? []).map((r) =>
    mapBatch(r as Record<string, unknown>),
  );
  return resolveImporterNames(batches);
}

export async function createImportBatch(input: {
  sourceName: string;
  targetTable: ImportTargetTable;
  fileName: string;
  rowCount: number;
  importedBy: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("import_batches").insert({
    source_name: input.sourceName.trim(),
    target_table: input.targetTable,
    file_name: input.fileName.slice(0, 260),
    row_count: input.rowCount,
    imported_by: input.importedBy,
  });
  if (error) throw new Error(error.message);
}

/**
 * System-initiated batch (e.g. Gmail cron). Service role; imported_by = null.
 */
export async function createSystemImportBatch(input: {
  sourceName: string;
  targetTable: ImportTargetTable;
  fileName: string;
  rowCount: number;
}): Promise<void> {
  if (!hasServiceRole()) {
    throw new Error("חסר מפתח שירות לרישום ייבוא מערכת");
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from("import_batches").insert({
    source_name: input.sourceName.trim(),
    target_table: input.targetTable,
    file_name: input.fileName.slice(0, 260),
    row_count: input.rowCount,
    imported_by: null,
  });
  if (error) throw new Error(error.message);
}
