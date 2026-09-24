# עוצמת התמרון — דאשבורד ניהול | מסמך מסירה

לקוח שהגיע דרך נתנאל (Agent4U). מטרת המערכת: דאשבורד מרכזי לניהול תפעולי, פיננסי ומשפטי, עם סוכני AI לניתוח הוצאות, נוכחות וגבייה.

---

## סטאק

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind 4, shadcn/ui
- **Backend/DB:** Supabase (Postgres + Auth + Storage), RLS על כל טבלה
- **Hosting מיועד:** Vercel
- **Branch עיקרי:** `migrate/nextjs-app-router`

המערכת עברה מיגרציה מלאה מ-OpenAI Sites/vinext starter (עם auth דרך ChatGPT, D1/Cloudflare) לסטאק סטנדרטי. אין יותר שום שארית מה-starter המקורי.

## איך מריצים

```bash
npm install
npm run dev
```

צריך `.env` (לא `.env.local` — כך הפרויקט מוגדר) עם:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # שרת בלבד — אף פעם לא NEXT_PUBLIC_
GOOGLE_CLIENT_ID=                # ל-Gmail OAuth
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=             # http://localhost:3000 בפיתוח
CRON_SECRET=                     # מגן על /api/cron/gmail-sync
```

**חשוב:** `.env` לא אמור להיות ב-git. תוודא עם `git check-ignore .env` לפני כל commit.

---

## מסד נתונים — טבלאות עיקריות

כל הטבלאות עם RLS מלא לפי תפקידים: `admin`, `operations`, `accounting`, `viewer` (מוגדרים ב-`profiles.role`, עם פונקציית עזר `get_user_role()`).

| טבלה | תיאור | כתיבה מותרת ל |
|---|---|---|
| `profiles` | תפקיד + שם לכל משתמש | admin בלבד |
| `employees` | עובדים | admin, operations |
| `vehicles` | רכבים | admin, operations |
| `vehicle_assignments` | היסטוריית שיוך רכב-עובד (רכב אחד פעיל לעובד, אכוף ב-DB) | admin, operations |
| `fines` | קנסות | admin, operations |
| `legal_cases` | תיקים משפטיים | admin בלבד |
| `legal_case_notes` | יומן הערות לתיק (append-only) | admin בלבד |
| `properties` | נכסים | admin בלבד |
| `tasks` | משימות | admin בלבד |
| `systems` | קטלוג מערכות (15 מקורות, `adapter_key` יציב) | admin בלבד |
| `expenses` | הוצאות — הליבה של ה-Expense Agent | admin, accounting |
| `invoices` | חשבוניות | admin, accounting |
| `payments` | תשלומים | admin, accounting |
| `clients` | לקוחות | admin בלבד |
| `projects` | פרויקטים | admin בלבד |
| `documents` | מטא-דאטה למסמכים מצורפים (generic, `entity_type`+`entity_id`) | לפי סוג הישות |
| `attendance_records` | נוכחות עובדים | admin, operations |
| `import_batches` | היסטוריית ייבוא קבצים | לפי טבלת היעד |
| `import_mapping_templates` | תבניות מיפוי עמודות לייבוא חוזר | admin, accounting, operations |
| `oauth_connections` | טוקני Gmail (ורחבה בעתיד) — **service-role בלבד, אף פעם לא נגיש ללקוח** | — |
| `oauth_connection_status` | View בלי טוקנים, admin-only, לתצוגת סטטוס חיבור | קריאה: admin |
| `audit_logs` | לוג מלא לכל פעולת כתיבה (trigger אוטומטי) | קריאה: admin |

**Storage:** bucket פרטי בשם `documents`, עם RLS על `storage.objects` שמשקף את מטריצת ההרשאות של טבלת `documents`.

---

## מסכים בנויים

| מסך | תיאור |
|---|---|
| `/` | דאשבורד ראשי — KPIs, קישור ל-`/attention` |
| `/employees`, `/vehicles`, `/fines`, `/legal`, `/legal/[id]`, `/properties`, `/tasks`, `/systems`, `/clients`, `/projects` | CRUD מלא לכל ישות |
| `/expenses` | טבלת הוצאות מאוחדת — סינון, עריכה inline (סטטוס/קטגוריה/עובד/רכב/לקוח/פרויקט), badge לחריגות, מסמכים מצורפים |
| `/attention` | תור פריטים לטיפול: הוצאות needs_review/missing_document/anomaly, קנסות חדשים, חשבוניות באיחור |
| `/reports` | סיכומים לפי תקופה (יום/שבוע/חודש), מקובץ לפי מטבע (לא ממיר) |
| `/collections` | גבייה — חשבוניות, ימי פיגור מחושבים, סיווג (תקין/בפיגור/דורש שיחה/משפטי), "פתח משימת גבייה" |
| `/attendance` | נוכחות — מול Mock TimeWatch, זיהוי איחור/חיסור, סיכום שבועי |
| `/imports` | ייבוא קבצים (CSV/Excel) עם מיפוי עמודות, preview, checkboxes, שני סוגי דגלי כפילות |
| `/systems/gmail/import` | preview + ייבוא ידני מ-Gmail |

---

## שכבת האינטגרציות (adapters)

יש interface אחיד (`SourceAdapter`) לכל 15 המערכות בקטלוג. כרגע:

| מערכת | סטטוס | הערה |
|---|---|---|
| **Gmail** | ✅ אמיתי | OAuth מלא, sync ידני + אוטומטי (כבוי כברירת מחדל, `gmail_sync_enabled`) |
| רווחית | Mock | יש API token רשמי (Settings→Online Settings→API), **חסר מספר עוסק מורשה** כדי להתחבר לממשק בכלל |
| Priority | Mock | יש credentials, **חסר URL/דרך כניסה** (ענן מול client מותקן — לא ידוע) |
| BDI | Mock | **נתנאל אישר scraping במפורש**, לא נבנה עדיין |
| Time Watch | Mock | יש login, **API רשמי קיים אך דורש פנייה לשירות לקוחות להפעלה** (בטיפול) |
| שאר 11 המערכות (בנק, מס״ב, Gov, פזומט וכו') | Mock | אין API אמיתי לאף אחת — ילכו דרך `/imports` (ייבוא קבצים) |

**עיקרון מרכזי:** בכל adapter, המעבר מ-Mock לאמיתי הוא **רק** החלפת מימוש ב-`lib/adapters/registry.ts` — שום שינוי ב-UI.

---

## מה חסר / TODO

### תלוי בגישה חיצונית (לא ניתן להתקדם בלעדיה)
- [ ] מספר עוסק מורשה לרווחית (לברר מול עמית, רו״ח החברה — `050-7740311`)
- [ ] URL/דרך כניסה ל-Priority
- [ ] הפעלת API ב-Time Watch (בטיפול מול שירות לקוחות)
- [ ] בניית `BdiAdapter` עם scraping (Playwright) — מאושר ע"י נתנאל, לא נבנה
- [ ] App Registration ל-Office 365 (Azure AD) — תלוי ב"סרגיי" מצד הלקוח
- [ ] **חיבור Gmail האמיתי** — כרגע מחובר לחשבון אישי של איתי לצורך בדיקה בלבד. כשיש גישה לחשבון עוצמת התמרון: להתנתק ולהתחבר מחדש דרך כרטיס Gmail ב-`/systems`

### לא קריטי, נשאר בכוונה מחוץ להיקף
- [ ] הצלבת נוכחות מול שכר עובדים — אין טבלת/מודול שכר בכלל, יידרש קודם
- [ ] המרת מטבעות בדוחות — `/reports` מציג לפי מטבע בנפרד (₪X · $Y), לא ממיר
- [ ] 2FA על הכניסה לדאשבורד עצמו (Supabase תומך ב-MFA מובנה, לא הופעל)
- [ ] התראות יזומות (מייל/וואטסאפ) על פריטים ב-`/attention` — יש רק מסך "תור לטיפול", לא push

### לפני מסירה ללקוח — ניקוי דאטת בדיקה
- [ ] הוצאות שיובאו מ-Gmail האישי של איתי (Supabase, Vercel, Lovable) — `source='gmail'`
- [ ] שורות מקובץ ה-CSV לדוגמה (בנק לאומי) שיובאו ל-`/imports`
- [ ] משתמשי בדיקה (`test-ops`, `test-accounting` אם עדיין קיימים)
- [ ] חשבונית/קנס בדיקה שנוצרו ב-`/collections`/`/attention`
- [ ] לבדוק `import_batches`, `audit_logs` — לא חובה למחוק (יומן), אבל לדעת שהם שם

**המלצה:** למחוק (soft-delete, `deleted_at`) ולא DELETE אמיתי, כדי לשמר את יכולת הבדיקה בעתיד אם צריך.

---

## עקרונות עבודה שחשוב לשמר

1. **אין scraping/אוטומציה מול בנק, רשות המסים, Gov.il** — רק ייבוא קבצים ידני. BDI הוא היוצא מן הכלל היחיד (אישור מפורש מהלקוח).
2. **סודות תמיד ב-`.env`, אף פעם לא בקוד/צ'אט** — במיוחד `SUPABASE_SERVICE_ROLE_KEY`.
3. **כל מיגרציה נבדקת לפני הרצה** — יש היסטוריה של שגיאות חוזרות (במיוחד ה-view `oauth_connection_status` שאיבד את הגנת ה-admin שלוש פעמים כי מיגרציות נכתבו בלי לדעת על תיקון קודם). מומלץ לכתוב SQL לשינויי סכמה ישירות, לא לתת לכלי AI לייצר קובץ מיגרציה עצמאי בלי לראות אותו קודם.
4. **Mock-first לכל אינטגרציה חדשה** — interface, Mock, ואז מימוש אמיתי כ-swap ב-registry. זה עבד היטב לאורך כל הפרויקט.
5. **RLS על כל טבלה חדשה, כולל Storage** — כתיבה מוגבלת לפי תפקיד, קריאה פתוחה לכל authenticated (חוץ ממה שרגיש: `oauth_connections`, `audit_logs`).
6. **פעולות הרסניות/רגישות דורשות אישור** (`ConfirmDialog`) — מחיקות, סימון חשבונית כשולם, bulk actions.