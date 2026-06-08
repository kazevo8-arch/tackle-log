import { useMemo, useState } from "react";
import { db } from "../db";
import { nowIso, primaryItemKinds, setupItems, uid } from "../domain";
import type { AppSnapshot } from "../App";
import type { FishingMethod, ItemKind, SetupItem } from "../models";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";

type SetupEditViewProps = {
  setupId?: string;
  snapshot: AppSnapshot;
  onBack: () => void;
  onSaved: () => void;
};

const methods: { id: FishingMethod; label: string }[] = [
  { id: "spinning", label: "スピニング" },
  { id: "bait", label: "ベイト" },
  { id: "fly_fishing", label: "フライ" },
  { id: "tenkara", label: "テンカラ" },
  { id: "bait_fishing", label: "餌釣り" },
];

function defaultRole(kind: ItemKind): SetupItem["role"] {
  if (kind === "rod" || kind === "reel" || kind === "line" || kind === "leader") return kind;
  if (primaryItemKinds.includes(kind)) return "primary";
  return "shared";
}

export function SetupEditView({ setupId, snapshot, onBack, onSaved }: SetupEditViewProps) {
  const existing = snapshot.setups.find((setup) => setup.id === setupId);
  const [name, setName] = useState(existing?.name ?? "");
  const [fishingMethod, setFishingMethod] = useState<FishingMethod>(existing?.fishingMethods[0] ?? "bait");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(existing?.items.map((item) => item.itemId) ?? []);
  const [defaultPrimaryItemId, setDefaultPrimaryItemId] = useState(existing?.defaultPrimaryItemId ?? "");

  const selectedItems = useMemo(
    () => snapshot.items.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds, snapshot.items],
  );
  const currentItems = setupItems(existing, snapshot.items);
  const primaryItems = selectedItems.filter((item) => primaryItemKinds.includes(item.kind));

  function toggleItem(itemId: string) {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  async function save() {
    if (!name.trim()) return;
    const updatedAt = nowIso();
    await db.setups.put({
      id: existing?.id ?? uid("setup"),
      name: name.trim(),
      fishingMethods: [fishingMethod],
      items: selectedItems.map((item) => ({ itemId: item.id, role: defaultRole(item.kind) })),
      defaultPrimaryItemId: defaultPrimaryItemId || primaryItems[0]?.id,
      mediaId: existing?.mediaId,
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
    });
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
        lines={[selectedItems.map((item) => item.name).join(" / ") || currentItems.map((item) => item.name).join(" / ") || "装備未選択"]}
      />

      <section className="panel form-grid">
        <label>
          <span>セット名</span>
          <input value={name} placeholder="例: 渓流ベイト" onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>釣法</span>
          <select value={fishingMethod} onChange={(event) => setFishingMethod(event.target.value as FishingMethod)}>
            {methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel">
        <h2>セットへ装備を追加</h2>
        <div className="check-list">
          {snapshot.items.map((item) => (
            <label key={item.id} className="check-row">
              <input checked={selectedItemIds.includes(item.id)} type="checkbox" onChange={() => toggleItem(item.id)} />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
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
          <EmptyState>ルアー/フライ/毛鉤/餌をセットへ追加してください。</EmptyState>
        )}
      </section>

      <button className="button button-primary" type="button" onClick={save}>
        保存する
      </button>
    </main>
  );
}
