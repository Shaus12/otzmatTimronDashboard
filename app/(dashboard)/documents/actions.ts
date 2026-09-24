"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";
import { toUserFacingError } from "@/lib/errors";
import {
  buildStoragePath,
  canWriteDocuments,
  isDocumentEntityType,
  sanitizeFileName,
  type DocumentEntityType,
  type DocumentWithUrl,
} from "@/lib/documents/types";
import {
  deleteDocumentRow,
  getDocument,
  insertDocumentRow,
  listDocumentsWithSignedUrls,
  removeFromDocumentsBucket,
  uploadToDocumentsBucket,
} from "@/lib/documents/store";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

function requireService() {
  if (!hasServiceRole()) {
    throw new Error("שירות האחסון אינו מוגדר");
  }
  return createServiceClient();
}

function revalidateEntity(entityType: DocumentEntityType, entityId: string) {
  if (entityType === "legal_case") {
    revalidatePath(`/legal/${entityId}`);
    revalidatePath("/legal");
  } else if (entityType === "expense") {
    revalidatePath("/expenses");
  }
}

export async function listEntityDocumentsAction(
  entityType: string,
  entityId: string,
): Promise<{ documents?: DocumentWithUrl[]; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: "יש להתחבר" };
    if (!isDocumentEntityType(entityType)) {
      return { error: "סוג ישות לא תקין" };
    }
    if (!entityId) return { error: "חסר מזהה ישות" };

    const supabase = requireService();
    const documents = await listDocumentsWithSignedUrls(
      supabase,
      entityType,
      entityId,
    );
    return { documents };
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

export async function uploadEntityDocumentAction(
  formData: FormData,
): Promise<{ document?: DocumentWithUrl; error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: "יש להתחבר" };

    const entityTypeRaw = String(formData.get("entityType") ?? "");
    const entityId = String(formData.get("entityId") ?? "");
    const file = formData.get("file");

    if (!isDocumentEntityType(entityTypeRaw)) {
      return { error: "סוג ישות לא תקין" };
    }
    if (!canWriteDocuments(profile.role, entityTypeRaw)) {
      return { error: "אין הרשאה להעלאת מסמך" };
    }
    if (!entityId) return { error: "חסר מזהה ישות" };
    if (!(file instanceof File)) return { error: "לא נבחר קובץ" };
    if (file.size <= 0) return { error: "הקובץ ריק" };
    if (file.size > MAX_BYTES) {
      return { error: "הקובץ גדול מדי (מקסימום 20MB)" };
    }

    const displayName = sanitizeFileName(file.name);
    const storagePath = buildStoragePath(entityTypeRaw, entityId, displayName);
    const bytes = await file.arrayBuffer();

    const supabase = requireService();
    await uploadToDocumentsBucket(
      supabase,
      storagePath,
      bytes,
      file.type || "application/octet-stream",
    );

    try {
      const record = await insertDocumentRow(supabase, {
        entityType: entityTypeRaw,
        entityId,
        fileName: displayName,
        storagePath,
        uploadedBy: profile.id,
      });
      revalidateEntity(entityTypeRaw, entityId);

      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(storagePath, 60 * 30);

      return {
        document: {
          ...record,
          downloadUrl: data?.signedUrl ?? null,
        },
      };
    } catch (metaError) {
      // Roll back orphaned storage object if metadata insert fails.
      await removeFromDocumentsBucket(supabase, storagePath).catch(() => {});
      throw metaError;
    }
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}

export async function deleteEntityDocumentAction(
  documentId: string,
): Promise<{ error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: "יש להתחבר" };
    if (!documentId) return { error: "חסר מזהה מסמך" };

    const supabase = requireService();
    const doc = await getDocument(supabase, documentId);
    if (!doc) return { error: "המסמך לא נמצא" };
    if (!canWriteDocuments(profile.role, doc.entityType)) {
      return { error: "אין הרשאה למחיקת מסמך" };
    }

    await removeFromDocumentsBucket(supabase, doc.storagePath);
    await deleteDocumentRow(supabase, documentId);
    revalidateEntity(doc.entityType, doc.entityId);
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}
