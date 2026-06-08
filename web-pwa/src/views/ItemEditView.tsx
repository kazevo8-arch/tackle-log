import { useState } from "react";
import { db } from "../db";
import { nowIso, uid } from "../domain";
import type { AppSnapshot } from "../App";
import type { ItemKind } from "../models";
import { PhotoCard, ScreenHeader } from "../components";

type ItemEditViewProps = {
  itemId?: string;
  snapshot: AppSnapshot;
  onSaved: () => void;
  onBack: () => void;
};

export function ItemEditView({ itemId, snapshot, onBack, onSaved }: ItemEditViewProps) {
  const existing = snapshot.items.find((item) => item.id === itemId);
  const firstCategory = snapshot.itemCategories[0];
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? firstCategory?.id ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const category = snapshot.itemCategories.find((item) => item.id === categoryId);

  async function save() {
    if (!category || !name.trim()) return;
    const updatedAt = nowIso();
    await db.items.put({
      id: existing?.id ?? uid("item"),
      categoryId,
      kind: category.kind as ItemKind,
      name: name.trim(),
      note: note.trim(),
      mediaId: existing?.mediaId,
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
    });
    onSaved();
  }

  return (
    <main className="screen-content">
      <ScreenHeader title={existing ? "装備編集" : "装備追加"} description="写真・カテゴリ・名前を管理します。写真保存本実装はPhase4で行います。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <PhotoCard
        title={name || "新しい装備"}
        photoLabel={category?.label ?? "写真"}
        lines={[category?.label ?? "カテゴリ未選択", "写真プレースホルダー"]}
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
      </section>

      <button className="button button-primary" type="button" onClick={save}>
        保存する
      </button>
    </main>
  );
}
