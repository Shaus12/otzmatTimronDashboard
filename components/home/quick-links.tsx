import Link from "next/link";
import {
  Building2,
  Car,
  ChevronLeft,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import { navLabels } from "@/lib/labels";

const links: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/employees", label: navLabels.employees, icon: Users },
  { href: "/vehicles", label: navLabels.vehicles, icon: Car },
  { href: "/properties", label: navLabels.properties, icon: Building2 },
  { href: "/legal", label: navLabels.legal, icon: Scale },
];

export function QuickLinks() {
  return (
    <section className="operations-strip">
      <div className="section-heading">
        <h2>ניהול שוטף</h2>
      </div>
      <div className="quick-links">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Icon size={20} />
            <span>{label}</span>
            <ChevronLeft size={16} />
          </Link>
        ))}
      </div>
    </section>
  );
}
