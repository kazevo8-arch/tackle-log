import { useMemo, useState } from "react";
import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";
import { fishingStyleLabel, itemKindLabel, itemLabel } from "../domain";
import type { ItemKind } from "../models";

type ItemsViewProps = {
  snapshot: AppSnapshot;
  onEditItem: (itemId?: string, initialKind?: ItemKind) => void;
};

export function ItemsView({ snapshot, onEditItem }: ItemsViewProps) {
  const [filter, setFilter] = useState<ItemKind | "all">("all");
  const sortedCategories = [...snapshot.itemCategories].sort((a, b) => a.sortOrder - b.sortOrder);
  const items = useMemo(
    () =>
      snapshot.items
        .filter((item) => filter === "all" || item.kind === filter)
        .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "ja-JP")),
    [filter, snapshot.items],
  );
  const addLabel = filter === "all" ? "＋ 装備を追加" : `＋ ${itemKindLabel(filter)}を追加`;

  return (
    <main className="screen-content">
      <ScreenHeader title="装備一覧" description="写真カードで道具を探し、ルアーやフライをセットへ再利用します。" />
      <button className="button button-secondary" type="button" onClick={() => onEditItem(undefined, filter === "all" ? undefined : filter)}>
        {addLabel}
      </button>

      <section className="panel">
        <h2>カテゴリ</h2>
        <div className="chip-grid">
          <button className={filter === "all" ? "chip chip-active" : "chip"} type="button" onClick={() => setFilter("all")}>
            すべて
          </button>
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              className={filter === category.kind ? "chip chip-active" : "chip"}
              type="button"
              onClick={() => setFilter(category.kind)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {items.length ? (
        items.map((item) => (
          <PhotoCard
            key={item.id}
            title={item.name}
            photoLabel={itemLabel(item, snapshot.itemCategories)}
            lines={[
              itemLabel(item, snapshot.itemCategories),
              item.fishingStyles.length ? item.fishingStyles.map(fishingStyleLabel).join(" / ") : "釣法未設定",
              item.tags.length ? item.tags.join(" / ") : item.note || "メモなし",
            ]}
          >
            <button className="button button-secondary button-compact" type="button" onClick={() => onEditItem(item.id, item.kind)}>
              編集
            </button>
          </PhotoCard>
        ))
      ) : (
        <EmptyState>該当する装備がありません。</EmptyState>
      )}
    </main>
  );
}
