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
  ShieldCheck,
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

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

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
        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <div>
            <strong>סביבת עבודה</strong>
            <p>
              המערכות והמעקב שלך,
              <br />
              מרוכזים במקום אחד.
            </p>
          </div>
        </div>
        <div className="profile">
          <span>עת</span>
          <div>
            <b>ניהול החברה</b>
            <small>עוצמת התמרון</small>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
