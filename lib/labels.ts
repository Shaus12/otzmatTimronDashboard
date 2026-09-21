import type {
  EmployeeStatus,
  FineStatus,
  LegalStatus,
  PropertyStatus,
  SystemCategory,
  TaskStatus,
  VehicleStatus,
} from "@/lib/data/types";

export const navLabels = {
  home: "סקירה כללית",
  systems: "כל המערכות",
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

export const adapterStatusLabels = {
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

export function formatIls(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isCompleteStatus(label: string): boolean {
  return ["הושלם", "פעיל", "שולם", "סגור"].includes(label);
}
