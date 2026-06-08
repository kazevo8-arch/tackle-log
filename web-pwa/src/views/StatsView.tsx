import type { AppSnapshot } from "../App";
import { EmptyState, ScreenHeader } from "../components";
import { itemStats, placeRecommendedItems, placeStats, setupStats, speciesStats, type CountStat } from "../stats";

type StatsViewProps = {
  snapshot: AppSnapshot;
  onUseItem: (itemId: string) => void;
  onUsePlace: (placeId: string) => void;
  onUseSetup: (setupId: string) => void;
};

function formatDate(value?: string) {
  if (!value) return "未記録";
  return new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function StatList({
  actionLabel,
  emptyText,
  onUse,
  stats,
  title,
}: {
  actionLabel?: string;
  emptyText: string;
  onUse?: (id: string) => void;
  stats: CountStat[];
  title: string;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {stats.length ? (
        <ol className="ranking-list">
          {stats.map((stat) => (
            <li className="ranking-row" key={stat.id}>
              <div>
                <strong>{stat.label}</strong>
                <span>
                  {stat.count}匹 / 最大 {stat.maxSize}cm / 最終 {formatDate(stat.lastCaughtAt)}
                </span>
              </div>
              {onUse && actionLabel ? (
                <button className="button button-secondary button-compact" type="button" onClick={() => onUse(stat.id)}>
                  {actionLabel}
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState>{emptyText}</EmptyState>
      )}
    </section>
  );
}

export function StatsView({ snapshot, onUseItem, onUsePlace, onUseSetup }: StatsViewProps) {
  const species = speciesStats(snapshot.results);
  const setups = setupStats(snapshot.results, snapshot.setups);
  const places = placeStats(snapshot.results, snapshot.places);
  const items = itemStats(snapshot.results, snapshot.items);
  const recommendations = placeRecommendedItems(snapshot.results, snapshot.places, snapshot.items);
  const topSetup = setups[0];
  const topPlace = places[0];
  const topItem = items[0];

  return (
    <main className="screen-content">
      <ScreenHeader title="実績" description="過去に釣れたセット・ポイント・ルアーを見て、次回の構成を決めます。" />

      <section className="panel active-panel">
        <p className="eyebrow">再利用候補</p>
        {topSetup || topPlace || topItem ? (
          <div className="reuse-grid">
            {topSetup ? (
              <button className="reuse-card" type="button" onClick={() => onUseSetup(topSetup.id)}>
                <span>よく釣れるセット</span>
                <strong>{topSetup.label}</strong>
                <small>{topSetup.count}匹 / 最大 {topSetup.maxSize}cm</small>
              </button>
            ) : null}
            {topPlace ? (
              <button className="reuse-card" type="button" onClick={() => onUsePlace(topPlace.id)}>
                <span>よく釣れるポイント</span>
                <strong>{topPlace.label}</strong>
                <small>{topPlace.count}匹 / 最大 {topPlace.maxSize}cm</small>
              </button>
            ) : null}
            {topItem ? (
              <button className="reuse-card" type="button" onClick={() => onUseItem(topItem.id)}>
                <span>よく釣れるルアー</span>
                <strong>{topItem.label}</strong>
                <small>{topItem.count}匹 / 最大 {topItem.maxSize}cm</small>
              </button>
            ) : null}
          </div>
        ) : (
          <EmptyState>釣果を追加すると、再利用候補が表示されます。</EmptyState>
        )}
      </section>

      <section className="panel">
        <h2>ポイント別おすすめルアー</h2>
        {recommendations.length ? (
          <div className="recommendation-list">
            {recommendations.map((place) => (
              <article className="recommendation-card" key={place.placeId}>
                <div className="recommendation-header">
                  <h3>{place.placeLabel}</h3>
                  <button className="button button-secondary button-compact" type="button" onClick={() => onUsePlace(place.placeId)}>
                    ポイントを使う
                  </button>
                </div>
                <ol className="ranking-list">
                  {place.recommendations.slice(0, 3).map((item, index) => (
                    <li className="ranking-row" key={item.itemId}>
                      <div>
                        <strong>{index + 1}位 {item.itemName}</strong>
                        <span>{item.count}匹 / 最大 {item.maxSize}cm</span>
                      </div>
                      <button className="button button-secondary button-compact" type="button" onClick={() => onUseItem(item.itemId)}>
                        使う
                      </button>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>ポイントとルアーが紐づいた釣果を追加すると表示されます。</EmptyState>
        )}
      </section>

      <StatList emptyText="魚種別実績はまだありません。" stats={species} title="魚種別実績" />
      <StatList actionLabel="使う" emptyText="セット別実績はまだありません。" onUse={onUseSetup} stats={setups} title="セット別実績" />
      <StatList actionLabel="使う" emptyText="ポイント別実績はまだありません。" onUse={onUsePlace} stats={places} title="ポイント別実績" />
      <StatList actionLabel="使う" emptyText="ルアー実績はまだありません。" onUse={onUseItem} stats={items} title="ルアー実績" />
    </main>
  );
}
