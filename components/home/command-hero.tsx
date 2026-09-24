import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw, ShieldCheck } from "lucide-react";

export function CommandHero({
  badge,
  attentionCount,
}: {
  badge: string;
  attentionCount: number;
}) {
  return (
    <section className="command-hero">
      <div className="command-hero-copy">
        <div className="command-hero-kicker">
          <span className="live-dot" />
          מרכז שליטה עסקי
          <span className="command-hero-badge">{badge}</span>
        </div>
        <h1>מבט אחד על כל מה שמניע את החברה.</h1>
        <p>
          כספים, עובדים, רכבים ומערכות תפעוליות — מחוברים לתמונת מצב אחת
          שמדגישה מה מתקדם ומה דורש טיפול.
        </p>
        <div className="command-hero-actions">
          <Link href="/reports" className="hero-primary-action">
            <BarChart3 size={17} />
            לדוחות המלאים
            <ArrowLeft size={15} />
          </Link>
          <Link href="/attention" className="hero-secondary-action">
            {attentionCount} פריטים לטיפול
          </Link>
        </div>
        <div className="command-hero-meta">
          <span><RefreshCw size={14} /> רענון נתונים אוטומטי</span>
          <span><ShieldCheck size={14} /> הרשאות לפי תפקיד</span>
        </div>
      </div>

      <div className="command-hero-visual" aria-hidden="true">
        <Image
          src="/operations-network.svg"
          alt=""
          width={560}
          height={360}
          priority
        />
        <div className="hero-floating-metric metric-finance">
          <small>כספים</small>
          <strong>מעקב רציף</strong>
        </div>
        <div className="hero-floating-metric metric-ops">
          <small>תפעול</small>
          <strong>16 מערכות</strong>
        </div>
      </div>
    </section>
  );
}
