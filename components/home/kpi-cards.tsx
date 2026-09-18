import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export function KpiCards({
  items,
}: {
  items: Array<{
    href: string;
    label: string;
    value: string;
    meta: string;
    icon: LucideIcon;
    accent?: boolean;
  }>;
}) {
  return (
    <section className="stats-grid" aria-label="סיכום הרשומות בדאשבורד">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`stat-card${item.accent ? " stat-3" : ""}`}
          >
            <div className="stat-top">
              <span>{item.label}</span>
              <Icon size={20} />
            </div>
            <strong>{item.value}</strong>
            <small>
              {item.meta}
              <ArrowLeft size={14} />
            </small>
          </Link>
        );
      })}
    </section>
  );
}
