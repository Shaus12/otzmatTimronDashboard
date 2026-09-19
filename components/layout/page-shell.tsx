import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { getCurrentProfile } from "@/lib/auth/profile";

function todayLabel() {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date());
}

export async function PageShell({
  section,
  children,
}: {
  section: string;
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <WorkspaceShell section={section} today={todayLabel()} profile={profile}>
      {children}
      <footer className="page-footer">
        <span>עוצמת התמרון · מרכז הניהול</span>
        <span>
          {profile
            ? `${profile.fullName} · ${profile.role}`
            : "מצב דמו מקומי (ללא Supabase)"}
        </span>
      </footer>
    </WorkspaceShell>
  );
}
