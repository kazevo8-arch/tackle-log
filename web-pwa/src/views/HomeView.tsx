import { useEffect } from "react";
import type { AppRoute } from "../routes";
import type { AppSnapshot } from "../App";
import { FlashNotice, PhotoCard, ScreenHeader, SetupSummary } from "../components";

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
  const previousResult = snapshot.results[0];
  const previousSetup = snapshot.setups.find((setup) => setup.id === previousResult?.setupId);
  const previousPlace = snapshot.places.find((place) => place.id === previousResult?.placeId);
  const previousPrimaryItem = snapshot.items.find((item) => item.id === previousResult?.primaryItemId);

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
                <dd>{currentSetup?.name ?? "未選択"}</dd>
              </div>
              <div>
                <dt>使用中</dt>
                <dd>{currentPrimaryItem?.name ?? "未選択"}</dd>
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
        lines={[
          currentPrimaryItem ? `${currentPrimaryItem.note || "実績メモなし"}` : "ルアー / フライ / 毛鉤 / 餌から選択",
        ]}
        onClick={() => onRouteChange("set-select")}
      />

      <PhotoCard
        badge={currentPlace?.isFavorite ? "★ お気に入り" : undefined}
        title={currentPlace?.pointName ?? "現在ポイント未選択"}
        photoLabel="ポイント"
        hint="タップして変更"
        lines={
          currentPlace
            ? [`${currentPlace.riverName} / ${currentPlace.areaName}`, currentPlace.note || "ポイントメモなし"]
            : ["ポイントを選ぶと場所実績に反映されます"]
        }
        onClick={() => onRouteChange("places")}
      />

      <button className="button button-primary" type="button" onClick={() => onRouteChange("result-add")}>
        釣果を追加
      </button>
      <button className="button button-secondary" type="button" onClick={() => onRouteChange("stats")}>
        実績を見る
      </button>

      {previousResult ? (
        <PhotoCard
          badge="前回釣行"
          title={`${previousResult.species} ${previousResult.sizeCm}cm`}
          photoLabel="魚"
          lines={[
            `${previousPlace?.riverName ?? ""} / ${previousPlace?.areaName ?? ""} / ${previousPlace?.pointName ?? ""}`,
            `${previousSetup?.name ?? "セット未記録"} + ${previousPrimaryItem?.name ?? "ルアー未記録"}`,
          ]}
        />
      ) : null}
    </main>
  );
}
