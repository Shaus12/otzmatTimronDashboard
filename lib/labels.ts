import type {
  AttendanceStatus,
  EmployeeStatus,
  ExpenseAnomalyFlag,
  ExpenseCategory,
  ExpenseStatus,
  FineStatus,
  LegalStatus,
  ProjectStatus,
  PropertyStatus,
  SystemCategory,
  TaskStatus,
  VehicleStatus,
} from "@/lib/data/types";

export const navLabels = {
  home: "סקירה כללית",
  systems: "כל המערכות",
  imports: "ייבוא קבצים",
  expenses: "הוצאות",
  attention: "דורש תשומת לב",
  reports: "סיכומים ודוחות",
  collections: "גבייה",
  attendance: "נוכחות",
  clients: "לקוחות",
  projects: "פרויקטים",
  employees: "עובדים",
  vehicles: "רכבים",
  properties: "דירות ונכסים",
  legal: "תיקים משפטיים",
  fines: "קנסות ואגרות",
  tasks: "משימות ומעקב",
} as const;

export const pageDescriptions = {
  home: "כל מה שצריך ליום העבודה, במקום אחד.",
  systems: "קיצורי דרך למערכות החברה, לפי תחום פעילות.",
  imports:
    "העלאת דוחות בנק, מס״ב וייצואים ידניים — מיפוי עמודות וייבוא לבדיקה.",
  expenses: "סקירת הוצאות, שיוך לעובד/רכב וטיפול בסטטוס.",
  attention: "תור אחוד להוצאות לבדיקה, חריגות, קנסות וחשבוניות באיחור.",
  reports: "סיכום הוצאות יומי/שבועי/חודשי לפי קטגוריה ומטבע.",
  collections: "מעקב חשבוניות, פיגורי תשלום ופתיחת משימות גבייה.",
  attendance: "סנכרון נוכחות מ־TimeWatch, חריגות וסיכום שבועי למנהל.",
  clients: "רשימת לקוחות — שם, טלפון ואימייל.",
  projects: "פרויקטים מול לקוחות וסטטוס ביצוע.",
  employees: "פרטי עובדים והרכב המשויך לכל עובד.",
  vehicles: "רכבי החברה, שיוכים לעובדים ומועדי חידוש.",
  properties: "כתובות, אנשי קשר ומועדי טיפול בנכסי החברה.",
  legal: "פרטי תיקים, אחריות ומועדים להמשך טיפול.",
  fines: "מעקב אחר קנסות, דוחות ואגרות.",
  tasks: "הדברים שצריך לקדם, מהבקשה ועד לביצוע.",
} as const;

export const systemCategoryLabels: Record<SystemCategory, string> = {
  finance: "כספים וחשבונות",
  hr: "עובדים ושכר",
  fleet: "רכב ותפעול",
  comms: "תקשורת ומשרד",
};

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  active: "פעיל",
  on_leave: "בחופשה",
  inactive: "לא פעיל",
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: "פעיל",
  in_service: "בטיפול",
  inactive: "לא פעיל",
};

export const fineStatusLabels: Record<FineStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  paid: "שולם",
  appealed: "בערעור",
};

export const legalStatusLabels: Record<LegalStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  closed: "סגור",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  active: "פעיל",
  in_progress: "בטיפול",
  inactive: "לא פעיל",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  open: "פתוח",
  in_progress: "בטיפול",
  done: "הושלם",
};

export const expenseStatusLabels: Record<ExpenseStatus, string> = {
  ok: "טופל",
  needs_review: "דורש בדיקה",
  missing_document: "חסר מסמך",
  duplicate: "כפול",
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  fuel: "דלק",
  tolls: "אגרות",
  maintenance: "תחזוקה",
  office: "משרד",
  insurance: "ביטוח",
  software: "תוכנה",
  other: "אחר",
};

export const expenseAnomalyLabels: Record<
  NonNullable<ExpenseAnomalyFlag>,
  string
> = {
  high_amount: "הוצאה גבוהה",
  unreviewed_recurring: "חיוב חוזר לא מוכר",
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "נוכח",
  late: "איחור",
  absent: "חיסור",
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: "פעיל",
  on_hold: "מושהה",
  completed: "הושלם",
  inactive: "לא פעיל",
};

export const adapterStatusLabels = {
  imported: "ייבוא חד־פעמי",
  mock: "מדומה",
  connected: "מחובר",
  error: "שגיאה",
  missing_access: "חסרה גישה",
  unrecognized: "לא מזוהה",
} as const;

export function formatDate(value: string | null | undefined): string {
  if (!value) return "ללא תאריך";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("he-IL");
}

export function formatMoney(amount: number, currency = "ILS"): string {
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: currency || "ILS",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatIls(amount: number): string {
  return formatMoney(amount, "ILS");
}

export function isCompleteStatus(label: string): boolean {
  return ["הושלם", "פעיל", "שולם", "סגור", "טופל"].includes(label);
}
