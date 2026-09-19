"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import type { Profile } from "@/lib/auth/profile";

export function WorkspaceShell({
  section,
  today,
  profile,
  children,
}: {
  section: string;
  today: string;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "246px" } as React.CSSProperties}
    >
      <AppSidebar profile={profile} />
      <main className="workspace">
        <TopBar section={section} today={today} />
        <div className="page-content">{children}</div>
      </main>
    </SidebarProvider>
  );
}
