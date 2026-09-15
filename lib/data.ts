export const kinds = ['systems','employees','vehicles','properties','legal','fines','tasks'] as const;
export type Kind = typeof kinds[number];
export type Item = {id:string;kind:Kind;name:string;detail:string;category:string;status:string;due:string;url:string;assignee:string;updated:string;deleted?:number};
export const labels:Record<Kind,string>={systems:'כל המערכות',employees:'עובדים',vehicles:'רכבים',properties:'דירות ונכסים',legal:'תיקים משפטיים',fines:'קנסות ואגרות',tasks:'משימות ומעקב'};
export const singular:Record<Kind,string>={systems:'מערכת',employees:'עובד',vehicles:'רכב',properties:'נכס',legal:'תיק',fines:'קנס או אגרה',tasks:'משימה'};
export const categories=['הכול','כספים וחשבונות','עובדים ושכר','רכב ותפעול','תקשורת ומשרד'];
const system=(id:string,name:string,detail:string,category:string,url=''):Item=>({id,kind:'systems',name,detail,category,url,status:url?'קישור זמין':'נדרש קישור',due:'',assignee:'',updated:''});
const task=(id:string,name:string,detail:string,status='פתוח',due=''):Item=>({id,kind:'tasks',name,detail,category:'',url:'',status,due,assignee:'',updated:'2026-09-15'});
export const initial:Item[]=[
 system('leumi','בנק לאומי','חשבונות הבנק של החברה','כספים וחשבונות','https://www.leumi.co.il/he'),
 system('rivhit','ריווחית','הנהלת חשבונות וחשבוניות','כספים וחשבונות','https://online1.rivhit.co.il/loginmanager/'),
 system('priority','Priority','ניהול הפעילות העסקית · יש להוסיף כתובת חברה','כספים וחשבונות'),
 system('tax','רשות המסים','האזור האישי ברשות המסים','כספים וחשבונות','https://www.gov.il/he/service/personal_area_taxes'),
 system('bdi','BDI','מידע עסקי ודוחות אשראי','כספים וחשבונות','https://www.bdicoface.co.il/'),
 system('masav','מס״ב','סליקה והעברות בנקאיות','כספים וחשבונות','https://www.masav.co.il/'),
 system('timewatch','TimeWatch','נוכחות ושעות עובדים','עובדים ושכר','https://a.timewatch.co.il/'),
 system('salary','שכר עובדים','יש להוסיף קישור למערכת השכר','עובדים ושכר'),
 system('pazomat','פזומט','דלק וניהול תדלוקים · אתר פז','רכב ותפעול','https://www.paz.co.il/'),
 system('gov','האזור האישי הממשלתי','קנסות ודוחות של הרצל','רכב ותפעול','https://my.gov.il/landing/index.html'),
 system('road6','כביש 6','חשבוניות נשלחות לתיבת Gmail','רכב ותפעול','https://www.kvish6.co.il/Service.aspx'),
 system('andromeda','אנדרומדה','יש להוסיף את כתובת המערכת','רכב ותפעול'),
 system('gmail','Gmail','דואר החברה וחשבוניות כביש 6','תקשורת ומשרד','https://mail.google.com/'),
 system('office','Office Mail','דואר המשרד · יש להסדיר הרשאת גישה','תקשורת ומשרד','https://outlook.office.com/mail/'),
 system('whatsapp','WhatsApp','תקשורת שוטפת · יש להסדיר הרשאת גישה','תקשורת ומשרד','https://web.whatsapp.com/'),
 system('invoices','טבלת חשבוניות','הטבלה נמצאת תחת המייל של גל','כספים וחשבונות'),
 task('access-whatsapp','הסדרת גישה לווטסאפ','לבדוק הרשאות ולחבר את חשבון החברה.'),
 task('access-office','הסדרת גישה למייל Office','לקבל גישה לתיבת הדואר של המשרד.'),
 task('invoice-link','הוספת טבלת החשבוניות','לאתר את הטבלה תחת המייל של גל ולהוסיף את הקישור במרכז המערכות.'),
 task('payroll-close','סגירת שכר ספטמבר','אישור שעות חריגות והעברת הקובץ לשכר.','הושלם','2026-09-04'),
 task('road6-review','בדיקת חיובי כביש 6','השוואת חשבוניות מול רשימת הרכבים.','הושלם','2026-09-08'),
 task('legal-followup','מעקב אחרי תיק ספקים','איסוף מסמך נוסף והעברה לעורך הדין.','בטיפול','2026-09-19'),
 {id:'employee-1',kind:'employees',name:'נועם אביטל',detail:'מנהל תפעול · noam@otzmat.demo',category:'',status:'פעיל',due:'',url:'',assignee:'',updated:'2026-09-15'},
 {id:'employee-2',kind:'employees',name:'מיה שלו',detail:'מנהלת כספים · maya@otzmat.demo',category:'',status:'פעיל',due:'',url:'',assignee:'',updated:'2026-09-15'},
 {id:'employee-3',kind:'employees',name:'אורן מזרחי',detail:'נהג ומחסנאי · oren@otzmat.demo',category:'',status:'פעיל',due:'',url:'',assignee:'',updated:'2026-09-15'},
 {id:'employee-4',kind:'employees',name:'דניאל רז',detail:'רכזת משרד · daniel@otzmat.demo',category:'',status:'בחופשה',due:'2026-09-22',url:'',assignee:'',updated:'2026-09-15'},
 {id:'vehicle-1',kind:'vehicles',name:'טויוטה קורולה · 58-431-27',detail:'2022 · היברידית · טיפול הבא בעוד 18 יום',category:'',status:'פעיל',due:'2026-10-03',url:'',assignee:'employee-1',updated:'2026-09-15'},
 {id:'vehicle-2',kind:'vehicles',name:'פורד טרנזיט · 91-672-14',detail:'2021 · מסחרית · ביטוח בתוקף',category:'',status:'פעיל',due:'2026-11-18',url:'',assignee:'employee-3',updated:'2026-09-15'},
 {id:'vehicle-3',kind:'vehicles',name:'יונדאי איוניק · 42-906-33',detail:'2023 · ליסינג · טסט בעוד 41 יום',category:'',status:'בטיפול',due:'2026-10-26',url:'',assignee:'',updated:'2026-09-15'},
 {id:'vehicle-4',kind:'vehicles',name:'סקודה אוקטביה · 77-215-09',detail:'2020 · פרטית · ללא חריגות',category:'',status:'פעיל',due:'2026-12-07',url:'',assignee:'employee-2',updated:'2026-09-15'},
 {id:'property-1',kind:'properties',name:'משרד ראשי · ראשון לציון',detail:'קומה 3 · 420 מ״ר · חוזה עד 2028',category:'',status:'פעיל',due:'2026-10-01',url:'',assignee:'מיה שלו',updated:'2026-09-15'},
 {id:'property-2',kind:'properties',name:'מחסן תפעולי · חולון',detail:'אזור התעשייה · 680 מ״ר · בדיקת כיבוי אש',category:'',status:'בטיפול',due:'2026-09-28',url:'',assignee:'נועם אביטל',updated:'2026-09-15'},
 {id:'property-3',kind:'properties',name:'דירה להשכרה · פתח תקווה',detail:'השקעה · 4 חדרים · חידוש חוזה קרוב',category:'',status:'פעיל',due:'2026-11-12',url:'',assignee:'מיה שלו',updated:'2026-09-15'},
 {id:'legal-1',kind:'legal',name:'תיק ספקים · 24-1187',detail:'מחלוקת מסחרית · מסמך תגובה ממתין',category:'',status:'בטיפול',due:'2026-09-19',url:'',assignee:'עו״ד שחר כהן',updated:'2026-09-15'},
 {id:'legal-2',kind:'legal',name:'חוזה שכירות · 24-0921',detail:'בדיקת סעיף הצמדה וחידוש',category:'',status:'פתוח',due:'2026-10-01',url:'',assignee:'מיה שלו',updated:'2026-09-15'},
 {id:'legal-3',kind:'legal',name:'תביעה קטנה · 25-0440',detail:'דיון נקבע לחודש הבא',category:'',status:'בטיפול',due:'2026-10-21',url:'',assignee:'עו״ד שחר כהן',updated:'2026-09-15'},
 {id:'fine-1',kind:'fines',name:'כביש 6 · אוגוסט',detail:'חיוב לבדיקה מול רכב 91-672-14',category:'',status:'בטיפול',due:'2026-09-18',url:'',assignee:'מיה שלו',updated:'2026-09-15'},
 {id:'fine-2',kind:'fines',name:'אגרת רישוי · רכב 42-906-33',detail:'תשלום נדרש לפני חידוש הטסט',category:'',status:'פתוח',due:'2026-10-26',url:'',assignee:'נועם אביטל',updated:'2026-09-15'},
 {id:'fine-3',kind:'fines',name:'דו״ח חניה · מרכז',detail:'בדיקת אפשרות לביטול',category:'',status:'בערעור',due:'2026-09-24',url:'',assignee:'עו״ד שחר כהן',updated:'2026-09-15'},
 {id:'fine-4',kind:'fines',name:'קנס עירוני · מחסן',detail:'מסמך תשלום התקבל',category:'',status:'שולם',due:'2026-09-06',url:'',assignee:'מיה שלו',updated:'2026-09-15'}
];
export function mergeItems(saved:Item[]){const map=new Map(initial.map(x=>[x.id,x]));saved.forEach(x=>map.set(x.id,x));return [...map.values()].filter(x=>!x.deleted);}
