/** Map technical DB/auth errors to short Hebrew messages for the UI. */

const CONSTRAINT_MESSAGES: Record<string, string> = {
  vehicle_assignments_employee_active_uidx:
    "העובד כבר משויך לרכב אחר. יש לבטל את השיוך הקיים לפני שיוך חדש.",
  vehicle_assignments_vehicle_active_uidx:
    "לרכב זה כבר יש שיוך פעיל.",
};

const FALLBACK = "לא הצלחנו להשלים את הפעולה. נסו שוב.";

function extractMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message ?? "");
  }
  return "";
}

function looksHebrew(message: string): boolean {
  return /[\u0590-\u05FF]/.test(message);
}

function looksTechnical(message: string): boolean {
  return /constraint|violates|duplicate key|foreign key|PGRST|postgres|supabase|permission denied|row-level security|null value|check constraint|23505|23503|42501/i.test(
    message,
  );
}

/** Convert any thrown/store error into a clear Hebrew message. */
export function toUserFacingError(error: unknown): string {
  const raw = extractMessage(error).trim();
  if (!raw) return FALLBACK;

  for (const [constraint, message] of Object.entries(CONSTRAINT_MESSAGES)) {
    if (raw.includes(constraint)) return message;
  }

  const lower = raw.toLowerCase();

  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "הערך כבר קיים במערכת ולא ניתן לשמור כפילות.";
  }
  if (lower.includes("foreign key") || lower.includes("violates foreign key")) {
    return "לא ניתן לשמור — חסרה רשומה מקושרת או שהקישור אינו תקין.";
  }
  if (
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    lower.includes("not authorized") ||
    lower.includes("jwt")
  ) {
    return "אין הרשאה לבצע פעולה זו.";
  }
  if (
    lower.includes("no data returned") ||
    lower.includes("not found") ||
    lower.includes("0 rows") ||
    lower.includes("pgrst116")
  ) {
    return "הרשומה לא נמצאה או שאינכם מורשים לגשת אליה.";
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch")
  ) {
    return "בעיית תקשורת. בדקו את החיבור ונסו שוב.";
  }
  if (lower.includes("null value") && lower.includes("violates")) {
    return "חסר שדה חובה. בדקו את הפרטים ונסו שוב.";
  }
  if (lower.includes("check constraint")) {
    return "אחד מהערכים אינו תקין. בדקו את הפרטים ונסו שוב.";
  }

  if (looksHebrew(raw) && !looksTechnical(raw)) {
    return raw;
  }

  return FALLBACK;
}

/** Throw a user-facing Error from a Supabase/PostgREST error object. */
export function throwDbError(
  error: { message?: string } | null | undefined,
): never {
  throw new Error(toUserFacingError(error?.message ?? FALLBACK));
}
