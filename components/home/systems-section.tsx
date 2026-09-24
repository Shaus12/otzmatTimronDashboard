"use client";

import { useState, useTransition } from "react";
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
      {status.accountEmail &&
      (status.state === "connected" || status.state === "error")
        ? ` · ${status.accountEmail}`
        : null}
    </span>
  );
}

function gmailFlashMessage(flash: string | null | undefined): string | null {
  switch (flash) {
    case "connected":
      return "Gmail חובר בהצלחה.";
    case "disconnected":
      return "חיבור Gmail נותק.";
    case "forbidden":
      return "אין הרשאה לפעולת Gmail.";
    case "config":
      return "חסרים מפתחות Google בסביבה.";
    case "denied":
      return "ההרשאה ב־Google נדחתה.";
    case "invalid_state":
      return "בקשת החיבור לא תקינה — נסו שוב.";
    case "disconnect_error":
      return "ניתוק Gmail נכשל.";
    case "error":
      return "חיבור Gmail נכשל.";
    default:
      return null;
  }
}


function GmailAutoSyncToggle({
  enabled,
  disabled,
}: {
  enabled: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (disabled || pending) return;
    const next = !on;
    setError(null);
    setOn(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/gmail/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: next }),
        });
        const data = (await res.json()) as { enabled?: boolean; error?: string };
        if (!res.ok) {
          setOn(!next);
          setError(data.error || "עדכון נכשל");
          return;
        }
        setOn(Boolean(data.enabled));
      } catch {
        setOn(!next);
        setError("עדכון נכשל");
      }
    });
  };

  return (
    <div className="gmail-sync-toggle">
      <label className="gmail-sync-toggle-label">
        <input
          type="checkbox"
          checked={on}
          disabled={disabled || pending}
          onChange={toggle}
        />
        <span>סנכרון אוטומטי</span>
      </label>
      <p className="gmail-sync-toggle-hint">
        כשפעיל — איסוף הוצאות מ־Gmail רץ ברקע (דורש CRON). מסך הייבוא הידני נשאר זמין.
      </p>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

export function SystemsGrid({
  systems,
  statuses = {},
  featuredOnly = false,
  isAdmin = false,
  gmailReplaceEmail = null,
  gmailFlash = null,
}: {
  systems: System[];
  statuses?: Record<string, AdapterStatus>;
  featuredOnly?: boolean;
  isAdmin?: boolean;
  gmailReplaceEmail?: string | null;
  gmailFlash?: string | null;
}) {
  const [selected, setSelected] = useState<System | null>(null);
  const flash = gmailFlashMessage(gmailFlash);
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

  const selectedIsGmail = Boolean(
    selected &&
      (selected.adapterKey === "gmail" || selected.id === "gmail"),
  );

  return (
    <>
      {gmailReplaceEmail !== null && isAdmin ? (
        <div className="gmail-replace-banner" role="alertdialog">
          <p>
            {gmailReplaceEmail
              ? `כבר מחובר כ־${gmailReplaceEmail}, להחליף?`
              : "כבר מחובר ל־Gmail, להחליף את החיבור?"}
          </p>
          <div className="form-actions" style={{ border: 0, paddingTop: 0, marginTop: 0 }}>
            <Button asChild className="primary-action">
              <a href="/api/auth/gmail/start?confirm=1">כן, החלף</a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/systems">ביטול</Link>
            </Button>
          </div>
        </div>
      ) : null}
      {flash ? <p className="adapter-status-message">{flash}</p> : null}
      <div className={`systems-grid${featuredOnly ? "" : " full-grid"}`}>
        {list.map((system) => {
          const Icon = systemIcons[system.id] || Layers;
          const color = systemColors[system.id] || "slate";
          const status = statuses[system.id] ?? {
            state: "unrecognized" as const,
            message: "לא מזוהה — אין מתאם מקושר למערכת זו",
          };
          const isGmail =
            system.adapterKey === "gmail" || system.id === "gmail";
          const showGmailConnect =
            isAdmin &&
            isGmail &&
            (status.state === "missing_access" ||
              status.state === "error" ||
              status.state === "mock");
          const showGmailDisconnect =
            isAdmin &&
            isGmail &&
            (status.state === "connected" || status.state === "error");
          const showGmailReconnect =
            isAdmin && isGmail && status.state === "connected";
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
                {isGmail && status.gmailSyncEnabled
                  ? " · סנכרון אוטומטי"
                  : null}
              </div>
              <div className="system-card-bottom">
                <span
                  className={
                    status.state === "unrecognized" ||
                    status.state === "missing_access"
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
                <div
                  className="system-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showGmailConnect ? (
                    <Button asChild size="sm" className="primary-action">
                      <a href="/api/auth/gmail/start">התחבר</a>
                    </Button>
                  ) : null}
                  {showGmailReconnect ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={`/api/auth/gmail/start?confirm=1`}
                        onClick={(e) => {
                          const email = status.accountEmail || "החשבון הנוכחי";
                          if (
                            !window.confirm(
                              `כבר מחובר כ־${email}, להחליף?`,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        החלף
                      </a>
                    </Button>
                  ) : null}
                  {showGmailDisconnect ? (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="/api/auth/gmail/disconnect"
                        onClick={(e) => {
                          if (!window.confirm("לנתק את חיבור Gmail?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        נתק
                      </a>
                    </Button>
                  ) : null}
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
                  {selectedStatus.accountEmail ? (
                    <div className="adapter-status-row">
                      <span>חשבון</span>
                      <strong dir="ltr">{selectedStatus.accountEmail}</strong>
                    </div>
                  ) : null}
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
              {isAdmin &&
              selectedIsGmail &&
              selectedStatus?.state === "connected" ? (
                <GmailAutoSyncToggle
                  key={`${selected.id}-${selectedStatus.gmailSyncEnabled ? "1" : "0"}`}
                  enabled={Boolean(selectedStatus.gmailSyncEnabled)}
                />
              ) : null}
              <div className="form-actions">
                {isAdmin &&
                (selected.adapterKey === "gmail" || selected.id === "gmail") &&
                (selectedStatus?.state === "missing_access" ||
                  selectedStatus?.state === "error" ||
                  selectedStatus?.state === "mock") ? (
                  <Button asChild className="primary-action">
                    <a href="/api/auth/gmail/start">התחבר</a>
                  </Button>
                ) : null}
                {isAdmin &&
                (selected.adapterKey === "gmail" || selected.id === "gmail") &&
                selectedStatus?.state === "connected" ? (
                  <Button asChild variant="outline">
                    <a
                      href="/api/auth/gmail/start?confirm=1"
                      onClick={(e) => {
                        const email =
                          selectedStatus.accountEmail || "החשבון הנוכחי";
                        if (
                          !window.confirm(`כבר מחובר כ־${email}, להחליף?`)
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      החלף חיבור
                    </a>
                  </Button>
                ) : null}
                {isAdmin &&
                (selected.adapterKey === "gmail" || selected.id === "gmail") &&
                (selectedStatus?.state === "connected" ||
                  selectedStatus?.state === "error") ? (
                  <Button asChild variant="outline">
                    <a
                      href="/api/auth/gmail/disconnect"
                      onClick={(e) => {
                        if (!window.confirm("לנתק את חיבור Gmail?")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      נתק
                    </a>
                  </Button>
                ) : null}
                {selectedStatus?.state === "connected" &&
                (selected.adapterKey === "gmail" || selected.id === "gmail") ? (
                  <>
                    <Button asChild>
                      <Link href="/systems/gmail">צפייה בהודעות</Link>
                    </Button>
                    {isAdmin ? (
                      <Button asChild className="primary-action">
                        <Link href="/systems/gmail/import">ייבוא הוצאות</Link>
                      </Button>
                    ) : null}
                  </>
                ) : null}
                {selectedStatus?.state === "imported" &&
                (selected.adapterKey === "gmail" || selected.id === "gmail") ? (
                  <Button asChild>
                    <Link href="/systems/gmail">צפייה בחשבוניות ועדכונים</Link>
                  </Button>
                ) : null}
                {selectedStatus?.state === "imported" &&
                (selected.adapterKey === "timewatch" ||
                  selected.id === "timewatch") ? (
                  <Button asChild>
                    <Link href="/systems/timewatch">צפייה בנתוני הנוכחות</Link>
                  </Button>
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
  isAdmin = false,
}: {
  systems: System[];
  statuses?: Record<string, AdapterStatus>;
  isAdmin?: boolean;
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
      <SystemsGrid
        systems={systems}
        statuses={statuses}
        featuredOnly
        isAdmin={isAdmin}
      />
    </section>
  );
}
