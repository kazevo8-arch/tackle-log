import { useMemo, useState } from "react";
import { db } from "../db";
import { fishingStyleLabel, fishingStyleOptions, itemKindLabel, nowIso, preferredKindsForStyle, primaryItemKinds, setupItems, uid } from "../domain";
import type { AppSnapshot } from "../App";
import type { FishingStyle, ItemKind, SetupItem } from "../models";
import { EmptyState, PhotoCard, ScreenHeader, SetupSummary } from "../components";

type SetupEditViewProps = {
  setupId?: string;
  snapshot: AppSnapshot;
  onBack: () => void;
  onSaved: () => void;
};

function defaultRole(kind: ItemKind): SetupItem["role"] {
  if (kind === "rod" || kind === "reel" || kind === "line" || kind === "leader") return kind;
  if (primaryItemKinds.includes(kind)) return "primary";
  return "shared";
}

export function SetupEditView({ setupId, snapshot, onBack, onSaved }: SetupEditViewProps) {
  const existing = snapshot.setups.find((setup) => setup.id === setupId);
  const [name, setName] = useState(existing?.name ?? "");
  const [fishingStyle, setFishingStyle] = useState<FishingStyle>(existing?.fishingStyle ?? "mountain_stream_bait");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(existing?.items.map((item) => item.itemId) ?? []);
  const [defaultPrimaryItemId, setDefaultPrimaryItemId] = useState(existing?.defaultPrimaryItemId ?? "");

  const selectedItems = useMemo(
    () => snapshot.items.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds, snapshot.items],
  );
  const currentItems = setupItems(existing, snapshot.items);
  const primaryItems = selectedItems.filter((item) => primaryItemKinds.includes(item.kind));
  const preferredKinds = preferredKindsForStyle(fishingStyle);

  const groupedItems = snapshot.itemCategories
    .sort((a, b) => {
      const aPreferred = preferredKinds.includes(a.kind);
      const bPreferred = preferredKinds.includes(b.kind);
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    })
    .map((category) => ({
      category,
      items: snapshot.items.filter((item) => item.kind === category.kind).sort((a, b) => a.name.localeCompare(b.name, "ja-JP")),
    }));
  const draftSetup = {
    id: existing?.id ?? "draft",
    name: name || "新しいセット",
    fishingStyle,
    items: selectedItems.map((item) => ({ itemId: item.id, role: defaultRole(item.kind) })),
    defaultPrimaryItemId: defaultPrimaryItemId || primaryItems[0]?.id,
    mediaId: existing?.mediaId,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };

  function toggleItem(itemId: string) {
    setSelectedItemIds((current) => (current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]));
  }

  async function save() {
    if (!name.trim()) return;
    const updatedAt = nowIso();
    await db.setups.put({
      id: existing?.id ?? uid("setup"),
      name: name.trim(),
      fishingStyle,
      items: selectedItems.map((item) => ({ itemId: item.id, role: defaultRole(item.kind) })),
      defaultPrimaryItemId: defaultPrimaryItemId || primaryItems[0]?.id,
      mediaId: existing?.mediaId,
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
    });
    onSaved();
  }

  async function remove() {
    if (!existing) return;
    if (snapshot.appState?.currentSetupId === existing.id) {
      window.alert("現在使用中セットは削除できません。");
      return;
    }
    if (!window.confirm("このセットを削除しますか？")) return;
    await db.setups.delete(existing.id);
    onSaved();
  }

  return (
    <main className="screen-content">
      <ScreenHeader title={existing ? "セット編集" : "セット作成"} description="セットへ装備を追加し、現在使用中候補を作ります。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <PhotoCard
        title={name || "新しいセット"}
        photoLabel="セット"
        lines={[fishingStyleLabel(fishingStyle), selectedItems.length ? `${selectedItems.length}件の装備を登録中` : "装備未選択"]}
      >
        <SetupSummary items={snapshot.items} setup={selectedItemIds.length ? draftSetup : existing} />
      </PhotoCard>

      <section className="panel form-grid">
        <label>
          <span>セット名</span>
          <input value={name} placeholder="例: 渓流ベイト" onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>釣法</span>
          <select value={fishingStyle} onChange={(event) => setFishingStyle(event.target.value as FishingStyle)}>
            {fishingStyleOptions.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel">
        <h2>セットへ装備を追加</h2>
        {groupedItems.map(({ category, items }) => (
          <details key={category.id} className="fold-panel" open={preferredKinds.includes(category.kind)}>
            <summary>
              <span>{category.label}</span>
              <small>{preferredKinds.includes(category.kind) ? "優先表示" : "その他候補"}</small>
            </summary>
            <div className="check-list">
              {items.length ? (
                items.map((item) => (
                  <label key={item.id} className="check-row">
                    <input checked={selectedItemIds.includes(item.id)} type="checkbox" onChange={() => toggleItem(item.id)} />
                    <span>{item.name}</span>
                  </label>
                ))
              ) : (
                <EmptyState>{`${itemKindLabel(category.kind)}はまだありません。`}</EmptyState>
              )}
            </div>
          </details>
        ))}
      </section>

      <section className="panel">
        <h2>現在使用中の初期値</h2>
        {primaryItems.length ? (
          <select value={defaultPrimaryItemId} onChange={(event) => setDefaultPrimaryItemId(event.target.value)}>
            <option value="">自動で選ぶ</option>
            {primaryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : (
          <EmptyState>ルアー / フライ / 毛鉤 / 餌をセットへ追加してください。</EmptyState>
        )}
      </section>

      <button className="button button-primary" type="button" onClick={save}>
        保存する
      </button>
      {existing ? (
        <button className="button button-secondary" type="button" onClick={remove}>
          削除する
        </button>
      ) : null}
    </main>
  );
}
