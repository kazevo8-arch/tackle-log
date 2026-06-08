import { useEffect, useState, type ReactNode } from "react";
import { setupDisplayEntries } from "./domain";
import type { Item, Media, Setup } from "./models";

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
  onClick,
  hint,
}: {
  title: string;
  lines: string[];
  badge?: string;
  photoLabel: string;
  children?: ReactNode;
  onClick?: () => void;
  hint?: string;
}) {
  const cardBody = (
    <>
      <div className="photo-placeholder">{photoLabel}</div>
      <div className="card-body">
        {badge ? <p className="badge">{badge}</p> : null}
        <h2>{title}</h2>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {hint ? <p className="card-hint">{hint}</p> : null}
        {children}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button className="photo-card photo-card-button" type="button" onClick={onClick}>
        {cardBody}
      </button>
    );
  }

  return (
    <article className="photo-card">
      {cardBody}
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

export function SetupSummary({ items, setup }: { items: Item[]; setup: Setup | undefined }) {
  const entries = setupDisplayEntries(setup, items);
  return (
    <div className="setup-summary">
      {entries.map((entry) => (
        <div className="setup-summary-row" key={entry.kind}>
          <span>{entry.label}</span>
          <strong>{entry.text}</strong>
        </div>
      ))}
      {!entries.length ? <p className="setup-summary-empty">装備未登録</p> : null}
    </div>
  );
}

export function FlashNotice({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="toast toast-success">{message}</p>;
}

export function BlobImage({
  alt,
  className,
  media,
  placeholder,
}: {
  alt: string;
  className?: string;
  media?: Media;
  placeholder: string;
}) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!media?.thumbnailBlob) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(media.thumbnailBlob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [media]);

  if (!url) {
    return <div className={className ?? "thumb-placeholder"}>{placeholder}</div>;
  }

  return <img alt={alt} className={className} src={url} />;
}
