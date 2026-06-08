import type { ReactNode } from "react";

export function ScreenHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="screen-header">
      <p className="eyebrow">Fishing Log MVP</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export function PhotoCard({
  title,
  lines,
  badge,
  photoLabel,
  children,
}: {
  title: string;
  lines: string[];
  badge?: string;
  photoLabel: string;
  children?: ReactNode;
}) {
  return (
    <article className="photo-card">
      <div className="photo-placeholder">{photoLabel}</div>
      <div className="card-body">
        {badge ? <p className="badge">{badge}</p> : null}
        <h2>{title}</h2>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {children}
      </div>
    </article>
  );
}

export function Panel({ title, children, tone }: { title?: string; children: ReactNode; tone?: "active" }) {
  return (
    <section className={tone === "active" ? "panel active-panel" : "panel"}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
