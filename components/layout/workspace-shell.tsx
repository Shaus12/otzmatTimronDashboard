"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";

export function WorkspaceShell({
  section,
  today,
  children,
}: {
  section: string;
  today: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "246px" } as React.CSSProperties}
    >
      <AppSidebar />
      <main className="workspace">
        <TopBar section={section} today={today} />
        <div className="page-content">{children}</div>
      </main>
    </SidebarProvider>
  );
}
