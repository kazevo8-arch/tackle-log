import { useEffect } from "react";
import type { AppRoute } from "../routes";
import type { AppSnapshot } from "../App";
import { BlobImage, FlashNotice, PhotoCard, ScreenHeader, SetupSummary } from "../components";
import { deletedItemLabel, deletedSetupLabel } from "../domain";

type HomeViewProps = {
  homeNotice?: string;
  onRouteChange: (route: AppRoute) => void;
  onStartSession: () => void;
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

export function HomeView({ homeNotice, onRouteChange, onStartSession, scrollToken, snapshot }: HomeViewProps) {
  const appState = snapshot.appState;
  const activeSession = snapshot.sessions.find((session) => session.id === appState?.activeSessionId);
  const currentSetup = snapshot.setups.find((setup) => setup.id === appState?.currentSetupId);
  const currentPlace = snapshot.places.find((place) => place.id === appState?.currentPlaceId);
  const currentPrimaryItem = snapshot.items.find((item) => item.id === appState?.currentPrimaryItemId);
  const latestResult = [...snapshot.results].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt))[0];
  const latestSetup = snapshot.setups.find((setup) => setup.id === latestResult?.setupId);
  const latestPlace = snapshot.places.find((place) => place.id === latestResult?.placeId);
  const latestPrimaryItem = snapshot.items.find((item) => item.id === latestResult?.primaryItemId);
  const latestMedia = snapshot.media.find((media) => media.id === latestResult?.fishMediaId);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [scrollToken]);

  return (
    <main className="screen-content">
      <ScreenHeader title="ホーム" description="セット・ルアー・ポイントを選び、釣れた構成を再利用します。" />
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
            <h2>釣行は開始していません</h2>
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
        lines={[currentSetup ? "構成を確認して次回も再利用できます" : "セットを選ぶと釣果に自動反映されます"]}
        onClick={() => onRouteChange("set-select")}
      >
        <SetupSummary items={snapshot.items} setup={currentSetup} />
      </PhotoCard>

      <PhotoCard
        title={currentPrimaryItem?.name ?? "現在使用中 未選択"}
        photoLabel="使用中"
        hint="タップして変更"
        lines={[currentPrimaryItem ? currentPrimaryItem.note || "実績メモなし" : "ルアー / フライ / 毛鉤 / 餌から選択"]}
        onClick={() => onRouteChange("set-select")}
      />

      <PhotoCard
        title={currentPlace?.riverName ?? "現在河川 未選択"}
        photoLabel="河川"
        hint="タップして変更"
        lines={[currentPlace ? `${currentPlace.areaName} / ${currentPlace.pointName}` : "河川を選ぶとポイント候補が絞れます"]}
        onClick={() => onRouteChange("rivers")}
      />

      <PhotoCard
        badge={currentPlace?.isFavorite ? "★ お気に入り" : undefined}
        title={currentPlace ? `${currentPlace.areaName} / ${currentPlace.pointName}` : "現在ポイント未選択"}
        photoLabel="ポイント"
        hint="タップして変更"
        lines={[currentPlace ? currentPlace.note || "ポイントメモなし" : "ポイントを選ぶと場所実績に反映されます"]}
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
          <BlobImage alt="最新釣果" className="result-thumb" media={latestMedia} placeholder="魚写真なし" />
          <div className="result-body">
            <h2>
              {latestResult.species} {latestResult.sizeCm}cm
            </h2>
            <p>{latestPlace?.riverName ?? "河川未記録"}</p>
            <p>{latestPlace ? `${latestPlace.areaName} / ${latestPlace.pointName}` : "ポイント未記録"}</p>
            <p>{latestSetup?.name ?? deletedSetupLabel()}</p>
            <p>{latestPrimaryItem?.name ?? deletedItemLabel()}</p>
          </div>
        </article>
      ) : null}
    </main>
  );
}
