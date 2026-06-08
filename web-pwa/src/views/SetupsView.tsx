import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";
import { setupItems } from "../domain";

type SetupsViewProps = {
  snapshot: AppSnapshot;
  onEditSetup: (setupId?: string) => void;
  onUseSetup: (setupId: string) => void;
};

export function SetupsView({ snapshot, onEditSetup, onUseSetup }: SetupsViewProps) {
  return (
    <main className="screen-content">
      <ScreenHeader title="セット一覧" description="再利用候補とすべてのセットを写真カードで選びます。" />
      <button className="button button-secondary" type="button" onClick={() => onEditSetup()}>
        ＋ セットを作る
      </button>
      {snapshot.setups.length ? (
        snapshot.setups.map((setup) => {
          const gear = setupItems(setup, snapshot.items).slice(0, 4);
          const resultCount = snapshot.results.filter((result) => result.setupId === setup.id).length;
          const maxSize = Math.max(0, ...snapshot.results.filter((result) => result.setupId === setup.id).map((result) => result.sizeCm));
          return (
            <PhotoCard
              key={setup.id}
              title={setup.name}
              photoLabel="セット"
              badge={setup.id === snapshot.appState?.currentSetupId ? "今日のセット" : undefined}
              lines={[`釣果 ${resultCount}匹 / 最大 ${maxSize || "-"}cm`, gear.map((item) => item.name).join(" / ") || "装備なし"]}
            >
              <div className="action-row">
                <button className="button button-primary button-compact" type="button" onClick={() => onUseSetup(setup.id)}>
                  使う
                </button>
                <button className="button button-secondary button-compact" type="button" onClick={() => onEditSetup(setup.id)}>
                  編集
                </button>
              </div>
            </PhotoCard>
          );
        })
      ) : (
        <EmptyState>セットがありません。</EmptyState>
      )}
    </main>
  );
}
