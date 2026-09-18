import { Car, Layers, ListChecks, Users } from "lucide-react";
import { getDataStore } from "@/lib/data";
import { navLabels, pageDescriptions } from "@/lib/labels";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeading } from "@/components/layout/page-heading";
import { KpiCards } from "@/components/home/kpi-cards";
import { SystemsSection } from "@/components/home/systems-section";
import { OpenTasksPanel } from "@/components/home/open-tasks-panel";
import { QuickLinks } from "@/components/home/quick-links";

export default async function HomePage() {
  const store = getDataStore();
  const [kpis, systems, tasks] = await Promise.all([
    store.getHomeKpis(),
    store.getSystems(),
    store.getTasks(),
  ]);

  return (
    <PageShell section={navLabels.home}>
      <PageHeading
        title="מבט אחד. הכול בשליטה."
        description={pageDescriptions.home}
        badge="נתוני דמו"
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
            href: "/tasks",
            label: "משימות פתוחות",
            value: String(kpis.openTaskCount).padStart(2, "0"),
            meta: "ממתינות להמשך טיפול",
            icon: ListChecks,
            accent: true,
          },
        ]}
      />

      <div className="overview-layout">
        <div className="main-column">
          <SystemsSection systems={systems} />
          <QuickLinks />
        </div>
        <aside className="right-column">
          <OpenTasksPanel tasks={tasks} />
          <section className="setup-note">
            <h3>שכבת נתונים מוכנה להחלפה</h3>
            <p>
              כל המסכים קוראים דרך ממשק DataStore. כרגע הנתונים מדומים — בהמשך
              ניתן להחליף ל־Supabase בלי לשנות את ה־UI.
            </p>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
