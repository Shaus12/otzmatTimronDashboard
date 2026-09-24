import type { SupabaseClient } from "@supabase/supabase-js";
import { throwDbError } from "@/lib/errors";
import {
  DOCUMENTS_BUCKET,
  SIGNED_URL_TTL_SECONDS,
  type DocumentEntityType,
  type DocumentRecord,
  type DocumentWithUrl,
} from "./types";

type Row = Record<string, unknown>;

function mapDocument(row: Row): DocumentRecord {
  return {
    id: String(row.id),
    entityType: String(row.entity_type) as DocumentEntityType,
    entityId: String(row.entity_id),
    fileName: String(row.file_name ?? ""),
    storagePath: String(row.storage_path ?? ""),
    uploadedBy: (row.uploaded_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function listDocuments(
  supabase: SupabaseClient,
  entityType: DocumentEntityType,
  entityId: string,
): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });
  if (error) throwDbError(error);
  return (data ?? []).map(mapDocument);
}

export async function listDocumentsWithSignedUrls(
  supabase: SupabaseClient,
  entityType: DocumentEntityType,
  entityId: string,
): Promise<DocumentWithUrl[]> {
  const docs = await listDocuments(supabase, entityType, entityId);
  const out: DocumentWithUrl[] = [];
  for (const doc of docs) {
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(doc.storagePath, SIGNED_URL_TTL_SECONDS);
    if (error) {
      out.push({ ...doc, downloadUrl: null });
      continue;
    }
    out.push({ ...doc, downloadUrl: data?.signedUrl ?? null });
  }
  return out;
}

export async function insertDocumentRow(
  supabase: SupabaseClient,
  input: {
    entityType: DocumentEntityType;
    entityId: string;
    fileName: string;
    storagePath: string;
    uploadedBy: string | null;
  },
): Promise<DocumentRecord> {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      file_name: input.fileName,
      storage_path: input.storagePath,
      uploaded_by: input.uploadedBy,
    })
    .select("*")
    .single();
  if (error) throwDbError(error);
  if (!data) throw new Error("לא התקבלה רשומת מסמך");
  return mapDocument(data);
}

export async function getDocument(
  supabase: SupabaseClient,
  id: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDbError(error);
  return data ? mapDocument(data) : null;
}

export async function deleteDocumentRow(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throwDbError(error);
}

export async function uploadToDocumentsBucket(
  supabase: SupabaseClient,
  storagePath: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: contentType || "application/octet-stream",
      upsert: false,
    });
  if (error) throw new Error(error.message || "העלאת הקובץ נכשלה");
}

export async function removeFromDocumentsBucket(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([storagePath]);
  if (error) throw new Error(error.message || "מחיקת הקובץ נכשלה");
}
