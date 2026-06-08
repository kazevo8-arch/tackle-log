import { useEffect, useMemo, useState } from "react";
import type { AppRoute } from "../routes";
import type { AppSnapshot } from "../App";
import { FlashNotice, PhotoModal, PhotoPreviewButton } from "../components";
import { deletedItemLabel, deletedSetupLabel, resultItemName, resultPointLabel, resultRiverName, resultSetupName } from "../domain";
import type { Media, Result } from "../models";

type HomeViewProps = {
  homeNotice?: string;
  onRouteChange: (route: AppRoute) => void;
  onStartSession: () => void;
  onToggleFavorite: (resultId: string) => void;
  scrollToken: number;
  snapshot: AppSnapshot;
};

function formatDateTime(value?: string) {
  if (!value) return "未記録";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function daysSince(value?: string) {
  if (!value) return "未記録";
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return "今日";
  if (days === 1) return "1日前";
  return `${days}日前`;
}

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CatchListRow({
  media,
  onOpenPhoto,
  onToggleFavorite,
  result,
}: {
  media?: Media;
  onOpenPhoto: () => void;
  onToggleFavorite: () => void;
  result: Result;
}) {
  return (
    <article className="home-catch-row">
      <PhotoPreviewButton
        alt={`${result.species} の釣果写真`}
        className="home-catch-thumb"
        media={media}
        onOpen={media ? onOpenPhoto : undefined}
        placeholder="魚写真なし"
      />
      <div className="home-catch-main">
        <strong>{result.species}</strong>
        <span>{result.sizeCm} cm</span>
      </div>
      <div className="home-catch-side">
        <span>{formatTime(result.caughtAt)}</span>
        <button className="favorite-toggle" type="button" onClick={onToggleFavorite}>
          {result.isFavorite ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}

export function HomeView({ homeNotice, onRouteChange, onStartSession, onToggleFavorite, scrollToken, snapshot }: HomeViewProps) {
  const appState = snapshot.appState;
  const activeSession = snapshot.sessions.find((session) => session.id === appState?.activeSessionId);
  const currentSetup = snapshot.setups.find((setup) => setup.id === appState?.currentSetupId);
  const currentPlace = snapshot.places.find((place) => place.id === appState?.currentPlaceId);
  const currentPrimaryItem = snapshot.items.find((item) => item.id === appState?.currentPrimaryItemId);
  const sortedResults = useMemo(() => [...snapshot.results].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt)), [snapshot.results]);
  const latestResult = sortedResults[0];
  const latestMedia = snapshot.media.find((media) => media.id === latestResult?.fishMediaId);
  const todayResults = useMemo(() => {
    const now = new Date();
    return sortedResults.filter((result) => isSameLocalDay(new Date(result.caughtAt), now)).slice(0, 2);
  }, [sortedResults]);
  const totalCatches = snapshot.results.length;
  const averageSize = totalCatches ? snapshot.results.reduce((sum, result) => sum + result.sizeCm, 0) / totalCatches : 0;
  const maxSize = totalCatches ? Math.max(...snapshot.results.map((result) => result.sizeCm)) : 0;
  const [previewMedia, setPreviewMedia] = useState<Media | undefined>();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [scrollToken]);

  return (
    <main className="screen-content home-screen">
      <header className="home-header">
        <button className="home-header-icon" type="button" aria-label="メニュー">
          <span className="menu-glyph" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <h1>Fishing Log</h1>
        <button className="home-header-icon" type="button" aria-label="設定">
          <span className="bell-glyph" aria-hidden="true" />
        </button>
      </header>

      <FlashNotice message={homeNotice} />

      <section className="trip-hero-card">
        <div className="trip-hero-overlay" />
        <div className="trip-hero-content">
          <div className="trip-hero-top">
            <span className="trip-hero-label">現在の釣行</span>
            <button className="trip-map-button" type="button" onClick={() => onRouteChange("places")}>
              地図
            </button>
          </div>
          <div className="trip-hero-copy">
            <h2>{currentPlace?.riverName ?? "河川を選択"}</h2>
            <p>{currentPlace?.pointName ?? "ポイントを選択"}</p>
          </div>
          <div className="trip-hero-bottom">
            <span>{currentPlace ? `${currentPlace.areaName} / ${currentPlace.pointName}` : "現在ポイント未選択"}</span>
            <span>{activeSession ? `開始 ${formatDateTime(activeSession.startedAt)}` : "釣行前"}</span>
          </div>
        </div>
      </section>

      <section className="home-setup-card">
        <button className="home-setup-pane" type="button" onClick={() => onRouteChange("set-select")}>
          <span className="home-setup-label">セット</span>
          <strong>{currentSetup?.name ?? deletedSetupLabel()}</strong>
        </button>
        <div className="home-setup-divider" />
        <button className="home-setup-pane" type="button" onClick={() => onRouteChange("set-select")}>
          <span className="home-setup-label">現在使用中</span>
          <strong>{currentPrimaryItem?.name ?? deletedItemLabel()}</strong>
        </button>
      </section>

      <div className="home-actions">
        <button className="home-action-primary" type="button" onClick={() => onRouteChange("result-add")}>
          釣果を追加
        </button>
        <button className="home-action-secondary" type="button" onClick={() => onRouteChange("places")}>
          ポイントを変更
        </button>
      </div>

      <section className="home-card">
        <div className="home-card-header">
          <h2>本日の釣果</h2>
          <button className="home-card-link" type="button" onClick={() => onRouteChange("results")}>
            すべて見る
          </button>
        </div>
        {todayResults.length ? (
          <div className="home-catch-list">
            {todayResults.map((result) => {
              const media = snapshot.media.find((item) => item.id === result.fishMediaId);
              return (
                <CatchListRow
                  key={result.id}
                  media={media}
                  onOpenPhoto={() => setPreviewMedia(media)}
                  onToggleFavorite={() => onToggleFavorite(result.id)}
                  result={result}
                />
              );
            })}
          </div>
        ) : (
          <div className="home-empty">今日はまだ釣果がありません。</div>
        )}
      </section>

      <section className="home-card">
        <div className="home-card-header">
          <h2>クイック実績</h2>
        </div>
        <div className="quick-stats-grid">
          <div className="quick-stat-cell">
            <span>釣果数</span>
            <strong>{totalCatches}匹</strong>
          </div>
          <div className="quick-stat-cell">
            <span>平均サイズ</span>
            <strong>{totalCatches ? averageSize.toFixed(1) : "-"} cm</strong>
          </div>
          <div className="quick-stat-cell">
            <span>最大サイズ</span>
            <strong>{maxSize || "-"} cm</strong>
          </div>
          <div className="quick-stat-cell">
            <span>最終釣行</span>
            <strong>{daysSince(latestResult?.caughtAt)}</strong>
          </div>
        </div>
      </section>

      {latestResult ? (
        <section className="home-last-trip">
          <p className="eyebrow">前回釣行</p>
          <h3>{resultSetupName(latestResult, snapshot.setups)}</h3>
          <p>{resultRiverName(latestResult, snapshot.places)}</p>
          <p>{resultPointLabel(latestResult, snapshot.places)}</p>
          <p>{resultItemName(latestResult, snapshot.items)}</p>
        </section>
      ) : null}

      {previewMedia ? <PhotoModal alt="釣果写真の拡大表示" media={previewMedia} onClose={() => setPreviewMedia(undefined)} title="釣果写真" /> : null}
      {latestMedia ? null : null}
    </main>
  );
}
