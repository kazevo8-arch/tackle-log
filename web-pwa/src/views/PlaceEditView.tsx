import { useState } from "react";
import type { AppSnapshot } from "../App";
import { PhotoCard, ScreenHeader } from "../components";
import { db } from "../db";
import { nowIso, uid } from "../domain";

type PlaceEditViewProps = {
  placeId?: string;
  snapshot: AppSnapshot;
  onBack: () => void;
  onSaved: () => void;
};

export function PlaceEditView({ placeId, snapshot, onBack, onSaved }: PlaceEditViewProps) {
  const existing = snapshot.places.find((place) => place.id === placeId);
  const [riverName, setRiverName] = useState(existing?.riverName ?? "");
  const [areaName, setAreaName] = useState(existing?.areaName ?? "");
  const [pointName, setPointName] = useState(existing?.pointName ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite ?? false);

  async function save() {
    if (!riverName.trim() || !areaName.trim() || !pointName.trim()) return;
    const updatedAt = nowIso();
    await db.places.put({
      id: existing?.id ?? uid("place"),
      riverName: riverName.trim(),
      areaName: areaName.trim(),
      pointName: pointName.trim(),
      note: note.trim(),
      isFavorite,
      lastUsedAt: existing?.lastUsedAt,
      latitude: existing?.latitude,
      longitude: existing?.longitude,
      mediaId: existing?.mediaId,
      createdAt: existing?.createdAt ?? updatedAt,
      updatedAt,
    });
    onSaved();
  }

  return (
    <main className="screen-content">
      <ScreenHeader title={existing ? "ポイント編集" : "ポイント追加"} description="釣果へ反映する河川・エリア・ポイントを登録します。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <PhotoCard
        title={pointName || "新しいポイント"}
        photoLabel="ポイント"
        badge={isFavorite ? "★ お気に入り" : undefined}
        lines={[riverName || "河川未入力", areaName || "エリア未入力", "写真保存はPhase4で実装"]}
      />

      <section className="panel form-grid">
        <label>
          <span>河川名</span>
          <input value={riverName} placeholder="例: 鮎沢川" onChange={(event) => setRiverName(event.target.value)} />
        </label>
        <label>
          <span>エリア名</span>
          <input value={areaName} placeholder="例: 上流" onChange={(event) => setAreaName(event.target.value)} />
        </label>
        <label>
          <span>ポイント名</span>
          <input value={pointName} placeholder="例: デイリー裏" onChange={(event) => setPointName(event.target.value)} />
        </label>
        <label>
          <span>メモ</span>
          <textarea value={note} placeholder="例: 朝だけ反応が良い" onChange={(event) => setNote(event.target.value)} />
        </label>
        <label className="check-row">
          <input checked={isFavorite} type="checkbox" onChange={(event) => setIsFavorite(event.target.checked)} />
          <span>お気に入りにする</span>
        </label>
      </section>

      <button className="button button-primary" type="button" onClick={save}>
        保存する
      </button>
    </main>
  );
}
