import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Layers,
  Landmark,
  ReceiptText,
  Clock3,
  Mail,
  MessageCircle,
  Fuel,
  BriefcaseBusiness,
  Users,
  Car,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";
import type { System } from "@/lib/data/types";
import { systemCategoryLabels } from "@/lib/labels";

const systemIcons: Record<string, LucideIcon> = {
  leumi: Landmark,
  rivhit: ReceiptText,
  priority: Layers,
  tax: Landmark,
  bdi: BriefcaseBusiness,
  masav: Landmark,
  timewatch: Clock3,
  salary: Users,
  pazomat: Fuel,
  gov: Landmark,
  road6: Car,
  andromeda: Layers,
  gmail: Mail,
  office: Mail,
  whatsapp: MessageCircle,
  invoices: FileSpreadsheet,
};

const systemColors: Record<string, string> = {
  leumi: "blue",
  rivhit: "coral",
  priority: "violet",
  timewatch: "teal",
  gmail: "coral",
  whatsapp: "green",
  pazomat: "yellow",
  bdi: "blue",
};

export function SystemsGrid({
  systems,
  featuredOnly = false,
}: {
  systems: System[];
  featuredOnly?: boolean;
}) {
  const featuredIds = [
    "leumi",
    "rivhit",
    "priority",
    "timewatch",
    "gmail",
    "whatsapp",
  ];
  const list = featuredOnly
    ? systems.filter((s) => featuredIds.includes(s.id))
    : systems;

  return (
    <div className={`systems-grid${featuredOnly ? "" : " full-grid"}`}>
      {list.map((system) => {
        const Icon = systemIcons[system.id] || Layers;
        const color = systemColors[system.id] || "slate";
        return (
          <article key={system.id} className="system-card">
            <div className="system-card-head">
              <div className={`app-icon ${color}`}>
                <Icon size={23} />
              </div>
            </div>
            <h3 dir="auto">{system.name}</h3>
            <p>{system.description}</p>
            <div className="system-card-meta">
              {systemCategoryLabels[system.category]}
            </div>
            <div className="system-card-bottom">
              <span className={system.url ? "link-state" : "link-state missing"}>
                {system.url ? "קישור למערכת" : "ממתין לקישור"}
              </span>
              {system.url ? (
                <a
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`פתיחת ${system.name} בכרטיסייה חדשה`}
                >
                  <ArrowUpLeft size={19} />
                </a>
              ) : (
                <span className="link-placeholder" aria-hidden />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function SystemsSection({ systems }: { systems: System[] }) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>המערכות שלך</h2>
          <p>קיצורי דרך למערכות המקור (ללא חיבור API עדיין)</p>
        </div>
        <Link className="text-button" href="/systems">
          לכל המערכות
          <ArrowLeft size={16} />
        </Link>
      </div>
      <SystemsGrid systems={systems} featuredOnly />
    </section>
  );
}
