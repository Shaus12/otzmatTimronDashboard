"use client";

import { CalendarDays } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopBar({
  section,
  today,
}: {
  section: string;
  today: string;
}) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <SidebarTrigger aria-label="פתיחת תפריט ניווט" />
        <span>סביבת עבודה</span>
        <span className="crumb-sep">/</span>
        <b>{section}</b>
      </div>
      <div className="topbar-meta">
        <CalendarDays size={16} />
        <span>{today}</span>
      </div>
    </header>
  );
}
