export function PageHeading({
  eyebrow = "עוצמת התמרון / מרכז הניהול",
  title,
  description,
  badge,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="title-line">
          <h1>{title}</h1>
          {badge ? <span className="demo-badge">{badge}</span> : null}
        </div>
        <p>{description}</p>
      </div>
    </section>
  );
}
