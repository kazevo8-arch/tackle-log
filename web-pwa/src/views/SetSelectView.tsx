import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader, SetupSummary } from "../components";
import { itemKindLabel, preferredKindsForStyle, setupPrimaryItems } from "../domain";
import type { AppRoute } from "../routes";

type SetSelectViewProps = {
  snapshot: AppSnapshot;
  onEditSetup: (setupId?: string) => void;
  onRouteChange: (route: AppRoute) => void;
  onUseSetup: (setupId: string) => void;
  onUsePrimaryItem: (setupId: string, itemId: string) => void;
};

export function SetSelectView({ snapshot, onEditSetup, onRouteChange, onUsePrimaryItem, onUseSetup }: SetSelectViewProps) {
  return (
    <main className="screen-content">
      <ScreenHeader title="今日のセット選択" description="今日使うセットと、現在使用中のルアー/フライを選びます。" />
      <div className="action-row">
        <button className="button button-secondary button-compact" type="button" onClick={() => onRouteChange("setups")}>
          セット一覧
        </button>
        <button className="button button-secondary button-compact" type="button" onClick={() => onRouteChange("items")}>
          装備一覧
        </button>
      </div>
      <div className="action-row">
        <button className="button button-primary button-compact" type="button" onClick={() => onEditSetup()}>
          新しいセットを作る
        </button>
        <button className="button button-secondary button-compact" type="button" onClick={() => onRouteChange("items")}>
          装備を追加する
        </button>
      </div>
      {snapshot.setups.length ? (
        snapshot.setups.map((setup) => {
          const primaryItems = setupPrimaryItems(setup, snapshot.items);
          const preferredKinds = preferredKindsForStyle(setup.fishingStyle);
          const preferredCandidates = primaryItems.filter((item) => preferredKinds.includes(item.kind));
          const otherCandidates = primaryItems.filter((item) => !preferredKinds.includes(item.kind));
          const missingLabels = preferredKinds.filter((kind) => ["lure", "fly", "hook", "bait"].includes(kind)).map(itemKindLabel);
          return (
            <section className="panel" key={setup.id}>
              <PhotoCard
                title={setup.name}
                photoLabel="セット"
                badge={setup.id === snapshot.appState?.currentSetupId ? "今日のセット" : undefined}
                lines={[preferredCandidates.length ? `${preferredCandidates.length}件の候補` : "現在使用中の候補はまだありません"]}
              >
                <SetupSummary items={snapshot.items} setup={setup} />
              </PhotoCard>
              <button className="button button-primary" type="button" onClick={() => onUseSetup(setup.id)}>
                このセットを使う
              </button>
              <button className="button button-secondary" type="button" onClick={() => onEditSetup(setup.id)}>
                セットを編集
              </button>

              <h2>現在使用中を選ぶ</h2>
              {preferredCandidates.length ? (
                <div className="card-grid">
                  {preferredCandidates.map((item) => (
                    <button
                      key={item.id}
                      className={
                        item.id === snapshot.appState?.currentPrimaryItemId ? "select-card select-card-active" : "select-card"
                      }
                      type="button"
                      onClick={() => onUsePrimaryItem(setup.id, item.id)}
                    >
                      <span className="mini-photo">{item.kind}</span>
                      <strong>{item.name}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <section className="panel subtle-panel">
                  <EmptyState>{`このセットには${missingLabels.join(" / ")}が登録されていません。`}</EmptyState>
                  <button className="button button-secondary" type="button" onClick={() => onEditSetup(setup.id)}>
                    セットを編集
                  </button>
                </section>
              )}

              {otherCandidates.length ? (
                <section className="panel subtle-panel">
                  <h3>その他候補</h3>
                  <div className="card-grid">
                    {otherCandidates.map((item) => (
                      <button
                        key={item.id}
                        className={
                          item.id === snapshot.appState?.currentPrimaryItemId ? "select-card select-card-active" : "select-card"
                        }
                        type="button"
                        onClick={() => onUsePrimaryItem(setup.id, item.id)}
                      >
                        <span className="mini-photo">{item.kind}</span>
                        <strong>{item.name}</strong>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </section>
          );
        })
      ) : (
        <EmptyState>セットがありません。</EmptyState>
      )}
    </main>
  );
}
