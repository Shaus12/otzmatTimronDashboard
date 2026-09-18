import { WorkspaceShell } from "@/components/layout/workspace-shell";

function todayLabel() {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date());
}

export function PageShell({
  section,
  children,
}: {
  section: string;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceShell section={section} today={todayLabel()}>
      {children}
      <footer className="page-footer">
        <span>עוצמת התמרון · מרכז הניהול</span>
        <span>נתוני דמו דרך DataStore · ללא חיבורי API חיצוניים</span>
      </footer>
    </WorkspaceShell>
  );
}
