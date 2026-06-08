import { useEffect, useState } from "react";
import type { AppRoute } from "../routes";
import type { AppSnapshot } from "../App";
import { FlashNotice, PhotoCard, PhotoModal, PhotoPreviewButton, ScreenHeader, SetupSummary } from "../components";
import { deletedItemLabel, deletedSetupLabel, resultItemName, resultPointLabel, resultRiverName, resultSetupName } from "../domain";

type HomeViewProps = {
  homeNotice?: string;
  onRouteChange: (route: AppRoute) => void;
  onStartSession: () => void;
  onToggleFavorite: (resultId: string) => void;
  scrollToken: number;
  snapshot: AppSnapshot;
};

function formatDateTime(value?: string) {
  if (!value) return "未設定";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HomeView({ homeNotice, onRouteChange, onStartSession, onToggleFavorite, scrollToken, snapshot }: HomeViewProps) {
  const appState = snapshot.appState;
  const activeSession = snapshot.sessions.find((session) => session.id === appState?.activeSessionId);
  const currentSetup = snapshot.setups.find((setup) => setup.id === appState?.currentSetupId);
  const currentPlace = snapshot.places.find((place) => place.id === appState?.currentPlaceId);
  const currentPrimaryItem = snapshot.items.find((item) => item.id === appState?.currentPrimaryItemId);
  const latestResult = [...snapshot.results].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt))[0];
  const latestMedia = snapshot.media.find((media) => media.id === latestResult?.fishMediaId);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [scrollToken]);

  return (
    <main className="screen-content">
      <ScreenHeader title="ホーム" description="セット・ルアー・ポイントを選び、釣れた流れをそのまま次回に再利用します。" />
      <FlashNotice message={homeNotice} />

      <section className="panel active-panel">
        <p className="eyebrow">釣行中</p>
        {activeSession ? (
          <>
            <h2>{activeSession.title}</h2>
            <dl className="metric-list">
              <div>
                <dt>開始</dt>
                <dd>{formatDateTime(activeSession.startedAt)}</dd>
              </div>
              <div>
                <dt>セット</dt>
                <dd>{currentSetup?.name ?? deletedSetupLabel()}</dd>
              </div>
              <div>
                <dt>使用中</dt>
                <dd>{currentPrimaryItem?.name ?? deletedItemLabel()}</dd>
              </div>
              <div>
                <dt>ポイント</dt>
                <dd>{currentPlace?.pointName ?? "未選択"}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <h2>釣行はまだ開始していません</h2>
            <button className="button button-secondary" type="button" onClick={onStartSession}>
              このセットで釣行開始
            </button>
          </>
        )}
      </section>

      <PhotoCard
        title={currentSetup?.name ?? "今日のセット未選択"}
        photoLabel="セット"
        hint="タップして変更"
        lines={[currentSetup ? "実績を見ながら次も使うセットを決めます。" : "セットを選ぶと釣果に自動で紐づきます。"]}
        onClick={() => onRouteChange("set-select")}
      >
        <SetupSummary items={snapshot.items} setup={currentSetup} />
      </PhotoCard>

      <PhotoCard
        title={currentPrimaryItem?.name ?? "現在使用中 未選択"}
        photoLabel="使用中"
        hint="タップして変更"
        lines={[currentPrimaryItem ? currentPrimaryItem.note || "いま投げている主力を記録します。" : "ルアー / フライ / 毛鉤 / 餌を選べます。"]}
        onClick={() => onRouteChange("set-select")}
      />

      <PhotoCard
        title={currentPlace?.riverName ?? "現在河川 未選択"}
        photoLabel="河川"
        hint="タップして変更"
        lines={[currentPlace ? `${currentPlace.areaName} / ${currentPlace.pointName}` : "河川から選ぶと、ポイント選択が分かりやすくなります。"]}
        onClick={() => onRouteChange("rivers")}
      />

      <PhotoCard
        badge={currentPlace?.isFavorite ? "★ お気に入り" : undefined}
        title={currentPlace ? `${currentPlace.areaName} / ${currentPlace.pointName}` : "現在ポイント 未選択"}
        photoLabel="ポイント"
        hint="タップして変更"
        lines={[currentPlace ? currentPlace.note || "ポイントメモなし" : "ポイントを選ぶと釣果に自動で紐づきます。"]}
        onClick={() => onRouteChange("places")}
      />

      <button className="button button-primary" type="button" onClick={() => onRouteChange("result-add")}>
        釣果を追加
      </button>
      <button className="button button-secondary" type="button" onClick={() => onRouteChange("stats")}>
        実績を見る
      </button>

      {latestResult ? (
        <article className="result-card">
          <PhotoPreviewButton
            alt="最新釣果の写真"
            className="result-thumb"
            media={latestMedia}
            onOpen={latestMedia ? () => setPreviewOpen(true) : undefined}
            placeholder="魚写真なし"
          />
          <div className="result-body">
            <div className="result-heading">
              <h2>
                {latestResult.species} {latestResult.sizeCm}cm
              </h2>
              <div className="result-flags">
                {latestResult.isFavorite ? <span className="badge">★ お気に入り</span> : null}
                {latestResult.isMemorial ? <span className="badge badge-outline">記念</span> : null}
              </div>
            </div>
            <p>{resultRiverName(latestResult, snapshot.places)}</p>
            <p>{resultPointLabel(latestResult, snapshot.places)}</p>
            <p>{resultSetupName(latestResult, snapshot.setups)}</p>
            <p>{resultItemName(latestResult, snapshot.items)}</p>
            <div className="inline-actions">
              <button className={latestResult.isFavorite ? "chip chip-active" : "chip"} type="button" onClick={() => onToggleFavorite(latestResult.id)}>
                {latestResult.isFavorite ? "★ お気に入り中" : "☆ お気に入り"}
              </button>
              {latestMedia ? (
                <button className="chip" type="button" onClick={() => setPreviewOpen(true)}>
                  写真を開く
                </button>
              ) : (
                <span className="result-photo-note">写真なし</span>
              )}
            </div>
          </div>
        </article>
      ) : null}

      {latestResult ? (
        <section className="panel">
          <p className="eyebrow">前回釣行</p>
          <h2>{resultSetupName(latestResult, snapshot.setups)}</h2>
          <p>{formatDateTime(latestResult.caughtAt)}</p>
          <p>{`${resultRiverName(latestResult, snapshot.places)} / ${resultPointLabel(latestResult, snapshot.places)}`}</p>
        </section>
      ) : null}

      {previewOpen ? <PhotoModal alt="最新釣果の拡大写真" media={latestMedia} onClose={() => setPreviewOpen(false)} title="最新釣果の写真" /> : null}
    </main>
  );
}
