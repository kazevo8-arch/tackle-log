import { useState } from "react";
import { db } from "../db";
import { fishingStyleLabel, fishingStyleOptions, nowIso, uid } from "../domain";
import type { AppSnapshot } from "../App";
import type { FishingStyle, ItemKind } from "../models";
import { PhotoCard, ScreenHeader } from "../components";

type ItemEditViewProps = {
  initialKind?: ItemKind;
  itemId?: string;
  snapshot: AppSnapshot;
  onSaved: () => void;
  onBack: () => void;
};

export function ItemEditView({ initialKind, itemId, snapshot, onBack, onSaved }: ItemEditViewProps) {
  const existing = snapshot.items.find((item) => item.id === itemId);
  const initialCategory = existing
    ? snapshot.itemCategories.find((item) => item.id === existing.categoryId)
    : initialKind
      ? snapshot.itemCategories.find((item) => item.kind === initialKind)
      : snapshot.itemCategories[0];

  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? initialCategory?.id ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [tagsText, setTagsText] = useState(existing?.tags.join(", ") ?? "");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(existing?.fishingStyles ?? []);
  const category = snapshot.itemCategories.find((item) => item.id === categoryId);
  const usedBySetups = snapshot.setups.filter((setup) => setup.items.some((entry) => entry.itemId === existing?.id));

  function toggleStyle(styleId: string) {
    setSelectedStyles((current) => (current.includes(styleId) ? current.filter((value) => value !== styleId) : [...current, styleId]));
  }

  async function save() {
    if (!category || !name.trim()) return;
    const updatedAt = nowIso();
    await db.items.put({
      id: existing?.id ?? uid("item"),
      categoryId,
      kind: category.kind as ItemKind,
      name: name.trim(),
      note: note.trim(),
      fishingStyles: selectedStyles.length ? (selectedStyles as FishingStyle[]) : ["other"],
      tags: tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      mediaId: existing?.mediaId,
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
    });
    onSaved();
  }

  async function remove() {
    if (!existing) return;
    if (snapshot.appState?.currentPrimaryItemId === existing.id) {
      window.alert("現在使用中の装備は削除できません。");
      return;
    }
    const usageMessage = usedBySetups.length ? `\nこの装備は${usedBySetups.length}件のセットで利用中です。セットからも外れます。` : "";
    if (!window.confirm(`この装備を削除しますか？${usageMessage}`)) return;

    await db.transaction("rw", [db.items, db.setups], async () => {
      await db.items.delete(existing.id);
      const affectedSetups = snapshot.setups.filter((setup) => setup.items.some((entry) => entry.itemId === existing.id));
      for (const setup of affectedSetups) {
        await db.setups.put({
          ...setup,
          items: setup.items.filter((entry) => entry.itemId !== existing.id),
          defaultPrimaryItemId: setup.defaultPrimaryItemId === existing.id ? undefined : setup.defaultPrimaryItemId,
          updatedAt: nowIso(),
        });
      }
    });
    onSaved();
  }

  return (
    <main className="screen-content">
      <ScreenHeader title={existing ? "装備編集" : "装備追加"} description="カテゴリ、対応釣法、タグを管理します。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <PhotoCard
        title={name || "新しい装備"}
        photoLabel={category?.label ?? "写真"}
        lines={[
          category?.label ?? "カテゴリ未選択",
          selectedStyles.length ? selectedStyles.map((style) => fishingStyleLabel(style as never)).join(" / ") : "釣法未設定",
          "写真プレースホルダー",
        ]}
      />

      <section className="panel form-grid">
        <label>
          <span>カテゴリ</span>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {snapshot.itemCategories
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span>装備名</span>
          <input value={name} placeholder="例: D-Compact 38" onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>メモ</span>
          <textarea value={note} placeholder="例: 瀬の開きで強い" onChange={(event) => setNote(event.target.value)} />
        </label>
        <label>
          <span>タグ</span>
          <input value={tagsText} placeholder="例: 本流, ミノー" onChange={(event) => setTagsText(event.target.value)} />
        </label>
      </section>

      <section className="panel">
        <h2>対応釣法</h2>
        <div className="chip-grid">
          {fishingStyleOptions.map((style) => (
            <button
              key={style.id}
              className={selectedStyles.includes(style.id) ? "chip chip-active" : "chip"}
              type="button"
              onClick={() => toggleStyle(style.id)}
            >
              {style.label}
            </button>
          ))}
        </div>
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
