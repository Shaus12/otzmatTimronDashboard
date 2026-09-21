"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  Car,
  Building2,
  Scale,
  ReceiptText,
  ListChecks,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navLabels } from "@/lib/labels";
import { roleLabels } from "@/lib/auth/permissions";
import type { Profile } from "@/lib/auth/profile";
import { signOut } from "@/app/login/actions";

const primaryLinks = [
  { href: "/", label: navLabels.home, icon: LayoutDashboard },
  { href: "/systems", label: navLabels.systems, icon: Layers },
  { href: "/tasks", label: navLabels.tasks, icon: ListChecks },
] as const;

const companyLinks = [
  { href: "/employees", label: navLabels.employees, icon: Users },
  { href: "/vehicles", label: navLabels.vehicles, icon: Car },
  { href: "/properties", label: navLabels.properties, icon: Building2 },
  { href: "/legal", label: navLabels.legal, icon: Scale },
  { href: "/fines", label: navLabels.fines, icon: ReceiptText },
] as const;

export function AppSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const initials = profile?.fullName?.slice(0, 2) || "עת";

  return (
    <Sidebar side="right" className="company-sidebar">
      <SidebarHeader className="brand">
        <div className="brand-icon">ע</div>
        <div>
          <strong>עוצמת התמרון</strong>
          <span>סביבת הניהול של החברה</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <p className="nav-label">סביבת עבודה</p>
        <SidebarMenu>
          {primaryLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                size="lg"
                isActive={isActive(href)}
                asChild
                onClick={() => setOpenMobile(false)}
              >
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                  {href === "/" && <span className="nav-square" />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <p className="nav-label spaced">ניהול החברה</p>
        <SidebarMenu>
          {companyLinks.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                size="lg"
                isActive={isActive(href)}
                asChild
                onClick={() => setOpenMobile(false)}
              >
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="profile">
          <span>{initials}</span>
          <div>
            <b>{profile?.fullName ?? "מצב דמו"}</b>
            <small>
              {profile ? roleLabels[profile.role] : "ללא התחברות"}
            </small>
          </div>
        </div>
        {profile ? (
          <form action={signOut} className="signout-form">
            <button type="submit">
              <LogOut size={15} />
              יציאה
            </button>
          </form>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
