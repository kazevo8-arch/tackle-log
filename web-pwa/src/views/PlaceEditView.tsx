import { useState } from "react";
import type { AppSnapshot } from "../App";
import { PhotoCard, ScreenHeader } from "../components";
import { db } from "../db";
import { nowIso, uid, uniqueRiverNames } from "../domain";

type PlaceEditViewProps = {
  placeId?: string;
  preferredRiverName?: string;
  snapshot: AppSnapshot;
  onBack: () => void;
  onSaved: () => void;
};

export function PlaceEditView({ placeId, preferredRiverName, snapshot, onBack, onSaved }: PlaceEditViewProps) {
  const existing = snapshot.places.find((place) => place.id === placeId);
  const rivers = uniqueRiverNames(snapshot.places);
  const initialRiverName = existing?.riverName ?? preferredRiverName ?? rivers[0] ?? "";
  const [useNewRiver, setUseNewRiver] = useState(existing ? false : !initialRiverName);
  const [riverName, setRiverName] = useState(initialRiverName);
  const [newRiverName, setNewRiverName] = useState("");
  const [areaName, setAreaName] = useState(existing?.areaName ?? "");
  const [pointName, setPointName] = useState(existing?.pointName ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite ?? false);

  async function save() {
    const resolvedRiverName = (useNewRiver ? newRiverName : riverName).trim();
    if (!resolvedRiverName || !areaName.trim() || !pointName.trim()) return;
    const updatedAt = nowIso();
    await db.places.put({
      id: existing?.id ?? uid("place"),
      riverName: resolvedRiverName,
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
      <ScreenHeader title={existing ? "ポイント編集" : "ポイント追加"} description="河川、エリア、ポイントを登録します。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <PhotoCard
        title={pointName || "新しいポイント"}
        photoLabel="ポイント"
        badge={isFavorite ? "★ お気に入り" : undefined}
        lines={[useNewRiver ? newRiverName || "新しい河川" : riverName || "河川未選択", areaName || "エリア未入力", "写真保存はPhase4で実装"]}
      />

      <section className="panel form-grid">
        <label>
          <span>河川</span>
          <select
            value={useNewRiver ? "__new__" : riverName}
            onChange={(event) => {
              if (event.target.value === "__new__") {
                setUseNewRiver(true);
                return;
              }
              setUseNewRiver(false);
              setRiverName(event.target.value);
            }}
          >
            {rivers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value="__new__">新しい河川を追加</option>
          </select>
        </label>
        {useNewRiver ? (
          <label>
            <span>新しい河川名</span>
            <input value={newRiverName} placeholder="例: 酒匂川水系" onChange={(event) => setNewRiverName(event.target.value)} />
          </label>
        ) : null}
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
