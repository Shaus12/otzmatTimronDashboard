"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canWrite } from "@/lib/auth/permissions";
import { getServiceDataStore } from "@/lib/data";
import { toUserFacingError } from "@/lib/errors";

/**
 * Append a note to a legal case.
 * Write gate matches legal_cases: admin only (canWrite "legal").
 */
export async function addLegalCaseNoteAction(
  legalCaseId: string,
  note: string,
): Promise<{ error?: string }> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !canWrite(profile.role, "legal")) {
      return { error: "אין הרשאה להוספת הערה בתיק" };
    }

    const text = note.trim();
    if (!text) return { error: "נא לכתוב הערה" };
    if (text.length > 4000) return { error: "ההערה ארוכה מדי" };

    // Service role after app-level auth — same pattern as other mutating paths
    // where RLS may not cover every related table yet.
    const store = await getServiceDataStore();
    const legalCase = await store.getLegalCase(legalCaseId);
    if (!legalCase) return { error: "התיק לא נמצא" };

    await store.createLegalCaseNote({
      legalCaseId,
      authorId: profile.id,
      note: text,
    });

    revalidatePath(`/legal/${legalCaseId}`);
    revalidatePath("/legal");
    return {};
  } catch (e) {
    return { error: toUserFacingError(e) };
  }
}
