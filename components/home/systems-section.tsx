"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { System } from "@/lib/data/types";
import type { AdapterStatus } from "@/lib/adapters/types";
import { adapterStatusLabels, formatDate, systemCategoryLabels } from "@/lib/labels";

const systemIcons: Record<string, LucideIcon> = {
  leumi: Landmark,
  bank_leumi: Landmark,
  rivhit: ReceiptText,
  priority: Layers,
  tax: Landmark,
  tax_authority: Landmark,
  bdi: BriefcaseBusiness,
  masav: Landmark,
  timewatch: Clock3,
  salary: Users,
  payroll: Users,
  pazomat: Fuel,
  gov: Landmark,
  gov_il: Landmark,
  road6: Car,
  andromeda: Layers,
  gmail: Mail,
  office: Mail,
  office_mail: Mail,
  whatsapp: MessageCircle,
  invoices: FileSpreadsheet,
};

const systemColors: Record<string, string> = {
  leumi: "blue",
  bank_leumi: "blue",
  rivhit: "coral",
  priority: "violet",
  timewatch: "teal",
  gmail: "coral",
  whatsapp: "green",
  pazomat: "yellow",
  bdi: "blue",
};

function formatSyncedAt(value?: string): string {
  if (!value) return "לא סונכרן";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value.slice(0, 10));
  return date.toLocaleString("he-IL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: AdapterStatus }) {
  return (
    <span className={`adapter-status-badge state-${status.state}`}>
      {adapterStatusLabels[status.state]}
    </span>
  );
}

export function SystemsGrid({
  systems,
  statuses = {},
  featuredOnly = false,
}: {
  systems: System[];
  statuses?: Record<string, AdapterStatus>;
  featuredOnly?: boolean;
}) {
  const [selected, setSelected] = useState<System | null>(null);
  const featuredIds = new Set([
    "leumi",
    "rivhit",
    "priority",
    "timewatch",
    "gmail",
    "whatsapp",
  ]);
  const featuredKeys = new Set([
    "bank_leumi",
    "rivhit",
    "priority",
    "timewatch",
    "gmail",
    "whatsapp",
  ]);
  const list = featuredOnly
    ? systems.filter(
        (s) =>
          featuredIds.has(s.id) ||
          (!!s.adapterKey && featuredKeys.has(s.adapterKey)),
      )
    : systems;

  const selectedStatus = selected
    ? (statuses[selected.id] ?? {
        state: "unrecognized" as const,
        message: "לא מזוהה — אין מתאם מקושר למערכת זו",
      })
    : undefined;

  return (
    <>
      <div className={`systems-grid${featuredOnly ? "" : " full-grid"}`}>
        {list.map((system) => {
          const Icon = systemIcons[system.id] || Layers;
          const color = systemColors[system.id] || "slate";
          const status = statuses[system.id] ?? {
            state: "unrecognized" as const,
            message: "לא מזוהה — אין מתאם מקושר למערכת זו",
          };
          return (
            <article
              key={system.id}
              className="system-card"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(system)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(system);
                }
              }}
            >
              <div className="system-card-head">
                <div className={`app-icon ${color}`}>
                  <Icon size={23} />
                </div>
                <StatusBadge status={status} />
              </div>
              <h3 dir="auto">{system.name}</h3>
              <p>{system.description}</p>
              <div className="system-card-meta">
                {systemCategoryLabels[system.category]}
                {status.lastSynced
                  ? ` · סונכרן ${formatSyncedAt(status.lastSynced)}`
                  : null}
              </div>
              <div className="system-card-bottom">
                <span
                  className={
                    status.state === "unrecognized"
                      ? "link-state missing"
                      : system.url
                        ? "link-state"
                        : "link-state missing"
                  }
                >
                  {status.message
                    ? status.message
                    : system.url
                      ? "קישור למערכת"
                      : "ממתין לקישור"}
                </span>
                {system.url ? (
                  <a
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`פתיחת ${system.name} בכרטיסייה חדשה`}
                    onClick={(e) => e.stopPropagation()}
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

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent dir="rtl" className="record-dialog">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected
                ? systemCategoryLabels[selected.category]
                : "סטטוס מקור"}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="adapter-status-panel">
              {selectedStatus ? (
                <>
                  <div className="adapter-status-row">
                    <span>סטטוס</span>
                    <StatusBadge status={selectedStatus} />
                  </div>
                  <div className="adapter-status-row">
                    <span>סנכרון אחרון</span>
                    <strong>{formatSyncedAt(selectedStatus.lastSynced)}</strong>
                  </div>
                  {selectedStatus.message ? (
                    <p className="adapter-status-message">
                      {selectedStatus.message}
                    </p>
                  ) : null}
                </>
              ) : null}
              <div className="form-actions">
                {selectedStatus?.state === "imported" && (selected.adapterKey === "gmail" || selected.id === "gmail") ? (
                  <Button asChild><Link href="/systems/gmail">צפייה בחשבוניות ועדכונים</Link></Button>
                ) : null}
                {selectedStatus?.state === "imported" && (selected.adapterKey === "timewatch" || selected.id === "timewatch") ? (
                  <Button asChild><Link href="/systems/timewatch">צפייה בנתוני הנוכחות</Link></Button>
                ) : null}
                {selected.url ? (
                  <Button asChild>
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      פתיחת המערכת
                      <ArrowUpLeft size={16} />
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" onClick={() => setSelected(null)}>
                  סגירה
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SystemsSection({
  systems,
  statuses = {},
}: {
  systems: System[];
  statuses?: Record<string, AdapterStatus>;
}) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>המערכות שלך</h2>
          <p>סטטוס מקור הנתונים ומועד העדכון של כל מערכת</p>
        </div>
        <Link className="text-button" href="/systems">
          לכל המערכות
          <ArrowLeft size={16} />
        </Link>
      </div>
      <SystemsGrid systems={systems} statuses={statuses} featuredOnly />
    </section>
  );
}
