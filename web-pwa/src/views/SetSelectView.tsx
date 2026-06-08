import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";
import { setupPrimaryItems } from "../domain";
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
      {snapshot.setups.length ? (
        snapshot.setups.map((setup) => {
          const primaryItems = setupPrimaryItems(setup, snapshot.items);
          return (
            <section className="panel" key={setup.id}>
              <PhotoCard
                title={setup.name}
                photoLabel="セット"
                badge={setup.id === snapshot.appState?.currentSetupId ? "今日のセット" : undefined}
                lines={[`${primaryItems.length}個のルアー/フライ候補`, "選ぶとホームに反映されます"]}
              />
              <button className="button button-primary" type="button" onClick={() => onUseSetup(setup.id)}>
                このセットを使う
              </button>
              <button className="button button-secondary" type="button" onClick={() => onEditSetup(setup.id)}>
                セットを編集
              </button>
              <h2>現在使用中を選ぶ</h2>
              <div className="card-grid">
                {primaryItems.map((item) => (
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
                {!primaryItems.length ? <EmptyState>ルアー/フライ/毛鉤/餌がありません。</EmptyState> : null}
              </div>
            </section>
          );
        })
      ) : (
        <EmptyState>セットがありません。</EmptyState>
      )}
    </main>
  );
}
