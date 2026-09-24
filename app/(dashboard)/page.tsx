import { AlertTriangle, Car, Layers, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getAdapterStatusesForSystems } from "@/lib/adapters";
import { getDataStore } from "@/lib/data";
import { buildAttentionQueue } from "@/lib/attention/queue";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { KpiCards } from "@/components/home/kpi-cards";
import { SystemsSection } from "@/components/home/systems-section";
import { OpenTasksPanel } from "@/components/home/open-tasks-panel";
import { AttentionPanel } from "@/components/home/attention-panel";
import { QuickLinks } from "@/components/home/quick-links";
import { TimewatchSummary } from "@/components/home/timewatch-summary";
import { readTimewatchSnapshot } from "@/lib/integrations/timewatch-snapshot";
import { readGmailSnapshot } from "@/lib/integrations/gmail-snapshot";
import { GmailSummary } from "@/components/home/gmail-summary";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getDataStore();
  const profile = await getCurrentProfile();
  const [kpis, systems, tasks, expenses, fines, invoices] = await Promise.all([
    store.getHomeKpis(),
    store.getSystems(),
    store.getTasks(),
    store.getExpenses(),
    store.getFines(),
    store.getInvoices(),
  ]);
  const attentionItems = buildAttentionQueue(expenses, fines, invoices);
  const featuredKeys = new Set([
    "bank_leumi",
    "rivhit",
    "priority",
    "timewatch",
    "gmail",
    "whatsapp",
  ]);
  const featuredIds = new Set([
    "leumi",
    "rivhit",
    "priority",
    "timewatch",
    "gmail",
    "whatsapp",
  ]);
  const featured = systems.filter(
    (s) =>
      (s.adapterKey && featuredKeys.has(s.adapterKey)) ||
      featuredIds.has(s.id),
  );
  const statuses = await getAdapterStatusesForSystems(featured);
  const timewatch = await readTimewatchSnapshot();
  const gmail = await readGmailSnapshot();

  return (
    <PageShell section={navLabels.home}>
      <PageHeading
        title="מבט אחד. הכול בשליטה."
        description={pageDescriptions.home}
        badge={
          process.env.NEXT_PUBLIC_SUPABASE_URL ? "מחובר ל־Supabase" : "נתוני דמו"
        }
      />

      <KpiCards
        items={[
          {
            href: "/systems",
            label: "מערכות במרכז",
            value: String(kpis.systemCount).padStart(2, "0"),
            meta: `${kpis.systemsWithUrl} קישורים זמינים`,
            icon: Layers,
          },
          {
            href: "/employees",
            label: "עובדים רשומים",
            value: String(kpis.employeeCount).padStart(2, "0"),
            meta: "ניהול פרטים ושיוך רכבים",
            icon: Users,
          },
          {
            href: "/vehicles",
            label: "רכבים במעקב",
            value: String(kpis.vehicleCount).padStart(2, "0"),
            meta: `${kpis.assignedVehicleCount} משויכים לעובדים`,
            icon: Car,
          },
          {
            href: "/attention",
            label: "דורש תשומת לב",
            value: String(attentionItems.length).padStart(2, "0"),
            meta: "הוצאות, חריגות וקנסות",
            icon: AlertTriangle,
            accent: true,
          },
        ]}
      />

      {timewatch.snapshot ? <TimewatchSummary snapshot={timewatch.snapshot}/> : null}
      {gmail.snapshot ? <GmailSummary snapshot={gmail.snapshot}/> : null}

      <div className="overview-layout">
        <div className="main-column">
          <SystemsSection
            systems={systems}
            statuses={statuses}
            isAdmin={profile?.role === "admin"}
          />
          <QuickLinks />
        </div>
        <aside className="right-column">
          <AttentionPanel items={attentionItems} />
          <OpenTasksPanel tasks={tasks} />
          <section className="setup-note">
            <h3>שכבת נתונים</h3>
            <p>
              כל המסכים קוראים דרך ממשק DataStore. עם משתני הסביבה של Supabase
              הנתונים מגיעים מהמסד האמיתי לפי הרשאות הפרופיל.
            </p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
