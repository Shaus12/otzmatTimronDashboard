import type { System, SystemCategory } from "./types";

/** Seed catalog of company systems (links only — no live integrations). */
const seed: Array<{
  id: string;
  name: string;
  description: string;
  category: SystemCategory;
  url: string | null;
  adapterKey: string | null;
}> = [
  {
    id: "leumi",
    name: "בנק לאומי",
    description: "חשבונות הבנק של החברה",
    category: "finance",
    url: "https://www.leumi.co.il/he",
    adapterKey: "bank_leumi",
  },
  {
    id: "rivhit",
    name: "ריווחית",
    description: "הנהלת חשבונות וחשבוניות",
    category: "finance",
    url: "https://online1.rivhit.co.il/loginmanager/",
    adapterKey: "rivhit",
  },
  {
    id: "priority",
    name: "Priority",
    description: "ניהול הפעילות העסקית · יש להוסיף כתובת חברה",
    category: "finance",
    url: null,
    adapterKey: "priority",
  },
  {
    id: "tax",
    name: "רשות המסים",
    description: "האזור האישי ברשות המסים",
    category: "finance",
    url: "https://www.gov.il/he/service/personal_area_taxes",
    adapterKey: "tax_authority",
  },
  {
    id: "bdi",
    name: "BDI",
    description: "מידע עסקי ודוחות אשראי",
    category: "finance",
    url: "https://www.bdicoface.co.il/",
    adapterKey: "bdi",
  },
  {
    id: "masav",
    name: "מס״ב",
    description: "סליקה והעברות בנקאיות",
    category: "finance",
    url: "https://www.masav.co.il/",
    adapterKey: "masav",
  },
  {
    id: "timewatch",
    name: "TimeWatch",
    description: "נוכחות ושעות עובדים",
    category: "hr",
    url: "https://a.timewatch.co.il/",
    adapterKey: "timewatch",
  },
  {
    id: "salary",
    name: "שכר עובדים",
    description: "יש להוסיף קישור למערכת השכר",
    category: "hr",
    url: null,
    adapterKey: "payroll",
  },
  {
    id: "pazomat",
    name: "פזומט",
    description: "דלק וניהול תדלוקים · אתר פז",
    category: "fleet",
    url: "https://www.paz.co.il/",
    adapterKey: "pazomat",
  },
  {
    id: "gov",
    name: "האזור האישי הממשלתי",
    description: "קנסות ודוחות ממשלתיים",
    category: "fleet",
    url: "https://my.gov.il/landing/index.html",
    adapterKey: "gov_il",
  },
  {
    id: "road6",
    name: "כביש 6",
    description: "חשבוניות נשלחות לתיבת הדואר",
    category: "fleet",
    url: "https://www.kvish6.co.il/Service.aspx",
    adapterKey: "road6",
  },
  {
    id: "andromeda",
    name: "אנדרומדה",
    description: "יש להוסיף את כתובת המערכת",
    category: "fleet",
    url: null,
    adapterKey: "andromeda",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "דואר החברה וחשבוניות כביש 6",
    category: "comms",
    url: "https://mail.google.com/",
    adapterKey: "gmail",
  },
  {
    id: "office",
    name: "Office Mail",
    description: "דואר המשרד · יש להסדיר הרשאת גישה",
    category: "comms",
    url: "https://outlook.office.com/mail/",
    adapterKey: "office_mail",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "תקשורת שוטפת · יש להסדיר הרשאת גישה",
    category: "comms",
    url: "https://web.whatsapp.com/",
    adapterKey: "whatsapp",
  },
  {
    id: "invoices",
    name: "טבלת חשבוניות",
    description: "טבלת מעקב חשבוניות מרכזית",
    category: "finance",
    url: null,
    adapterKey: null,
  },
];

const STAMP = "2026-09-15T10:00:00.000Z";

export function getSystemCatalog(): System[] {
  return seed.map((s) => ({
    ...s,
    createdAt: STAMP,
    updatedAt: STAMP,
  }));
}
