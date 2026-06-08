import { useEffect, useMemo, useState } from "react";
import type { AppSnapshot } from "../App";
import { EmptyState, FlashNotice, PhotoModal, PhotoPreviewButton, ScreenHeader } from "../components";
import { db } from "../db";
import { createMediaFromImage } from "../media";
import { nowIso, setupPrimaryItems, uniqueRiverNames } from "../domain";
import type { Result } from "../models";

type ResultEditViewProps = {
  resultId?: string;
  snapshot: AppSnapshot;
  onBack: () => void;
  onSaved: () => void;
};

const speciesOptions = ["ニジマス", "ヤマメ", "アマゴ", "イワナ", "ブラウン", "その他"];
const sizePresets = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80];

function resolveInitialRiver(result: Result, snapshot: AppSnapshot) {
  const place = snapshot.places.find((item) => item.id === result.placeId);
  return place?.riverName ?? result.riverNameSnapshot ?? "";
}

export function ResultEditView({ resultId, snapshot, onBack, onSaved }: ResultEditViewProps) {
  const result = snapshot.results.find((item) => item.id === resultId);
  const existingMedia = snapshot.media.find((item) => item.id === result?.fishMediaId);
  const rivers = uniqueRiverNames(snapshot.places);

  const [species, setSpecies] = useState(result?.species ?? "ニジマス");
  const [sizeCm, setSizeCm] = useState(result?.sizeCm ?? 25);
  const [setupId, setSetupId] = useState(result?.setupId ?? snapshot.appState?.currentSetupId ?? snapshot.setups[0]?.id ?? "");
  const [riverName, setRiverName] = useState(result ? resolveInitialRiver(result, snapshot) : rivers[0] ?? "");
  const [placeId, setPlaceId] = useState(result?.placeId ?? "");
  const [primaryItemId, setPrimaryItemId] = useState(result?.primaryItemId ?? "");
  const [isFavorite, setIsFavorite] = useState(Boolean(result?.isFavorite));
  const [isMemorial, setIsMemorial] = useState(Boolean(result?.isMemorial));
  const [newPhoto, setNewPhoto] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [removePhoto, setRemovePhoto] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedSetup = snapshot.setups.find((setup) => setup.id === setupId);
  const visiblePlaces = snapshot.places.filter((place) => place.riverName === riverName);
  const selectedPlace = snapshot.places.find((place) => place.id === placeId);
  const setupPrimaryCandidates = setupPrimaryItems(selectedSetup, snapshot.items);

  useEffect(() => {
    if (!visiblePlaces.some((place) => place.id === placeId)) {
      setPlaceId(visiblePlaces[0]?.id ?? "");
    }
  }, [placeId, visiblePlaces]);

  useEffect(() => {
    if (!setupPrimaryCandidates.some((item) => item.id === primaryItemId)) {
      setPrimaryItemId(selectedSetup?.defaultPrimaryItemId ?? setupPrimaryCandidates[0]?.id ?? "");
    }
  }, [primaryItemId, selectedSetup, setupPrimaryCandidates]);

  useEffect(() => {
    if (!newPhoto) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(newPhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newPhoto]);

  if (!result) {
    return (
      <main className="screen-content">
        <section className="panel">
          <h1>釣果が見つかりません</h1>
          <button className="button button-secondary" type="button" onClick={onBack}>
            釣果一覧へ戻る
          </button>
        </section>
      </main>
    );
  }

  const existingResult = result;

  function selectPhoto(file?: File) {
    setMessage(undefined);
    setError(undefined);
    if (!file) {
      setNewPhoto(undefined);
      return;
    }
    const lowerName = file.name.toLowerCase();
    if ([".dng", ".raw", ".arw", ".cr2", ".nef", ".orf", ".rw2"].some((extension) => lowerName.endsWith(extension))) {
      setNewPhoto(undefined);
      setError("DNG / RAW 形式は未対応です。HEIC / HEIF / JPEG / PNG を選んでください。");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setNewPhoto(undefined);
      setError("画像ファイルを選んでください。");
      return;
    }
    setRemovePhoto(false);
    setNewPhoto(file);
  }

  async function save() {
    setMessage(undefined);
    setError(undefined);
    if (!selectedSetup) {
      setError("セットを選んでください。");
      return;
    }
    if (!selectedPlace) {
      setError("ポイントを選んでください。");
      return;
    }
    if (!species.trim()) {
      setError("魚種を選んでください。");
      return;
    }

    setSaving(true);
    try {
      const updatedAt = nowIso();
      const newMedia = newPhoto ? await createMediaFromImage(newPhoto) : undefined;
      const nextPrimaryItem = snapshot.items.find((item) => item.id === primaryItemId);
      const nextUsedItemIds = selectedSetup.items.map((item) => item.itemId);
      const deleteOldMediaId = (removePhoto || newMedia) && existingResult.fishMediaId ? existingResult.fishMediaId : undefined;

      await db.transaction("rw", [db.media, db.results], async () => {
        if (newMedia) {
          await db.media.put(newMedia);
        }
        await db.results.update(existingResult.id, {
          setupId: selectedSetup.id,
          placeId: selectedPlace.id,
          primaryItemId: nextPrimaryItem?.id,
          usedItemIds: nextUsedItemIds,
          isFavorite,
          isMemorial,
          setupNameSnapshot: selectedSetup.name,
          primaryItemNameSnapshot: nextPrimaryItem?.name,
          riverNameSnapshot: selectedPlace.riverName,
          areaNameSnapshot: selectedPlace.areaName,
          pointNameSnapshot: selectedPlace.pointName,
          species: species.trim(),
          sizeCm,
          fishMediaId: removePhoto ? undefined : newMedia?.id ?? existingResult.fishMediaId,
          updatedAt,
        });
        if (deleteOldMediaId) {
          await db.media.delete(deleteOldMediaId);
        }
      });

      setMessage("保存しました");
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  const previewMedia = useMemo(() => {
    if (removePhoto) return undefined;
    if (!newPhoto) return existingMedia;
    return undefined;
  }, [existingMedia, newPhoto, removePhoto]);

  return (
    <main className="screen-content">
      <ScreenHeader title="釣果編集" description="魚種・サイズ・場所・セット・使用アイテムをあとから修正できます。" />
      <button className="link-button" type="button" onClick={onBack}>
        ← 戻る
      </button>

      <section className="panel form-grid">
        <label>
          <span>魚種</span>
          <select value={species} onChange={(event) => setSpecies(event.target.value)}>
            {speciesOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>サイズ</span>
          <div className="size-grid">
            {sizePresets.map((size) => (
              <button
                key={size}
                className={sizeCm === size ? "chip chip-active" : "chip"}
                type="button"
                onClick={() => setSizeCm(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="size-adjuster">
            <button className="button button-secondary button-compact" type="button" onClick={() => setSizeCm(Math.max(1, sizeCm - 1))}>
              -1
            </button>
            <label>
              <span>cm</span>
              <input min={1} type="number" value={sizeCm} onChange={(event) => setSizeCm(Number(event.target.value) || 1)} />
            </label>
            <button className="button button-secondary button-compact" type="button" onClick={() => setSizeCm(sizeCm + 1)}>
              +1
            </button>
          </div>
        </label>
        <label>
          <span>セット</span>
          <select value={setupId} onChange={(event) => setSetupId(event.target.value)}>
            {snapshot.setups.map((setup) => (
              <option key={setup.id} value={setup.id}>
                {setup.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>河川</span>
          <select value={riverName} onChange={(event) => setRiverName(event.target.value)}>
            {rivers.map((river) => (
              <option key={river} value={river}>
                {river}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>ポイント</span>
          <select value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
            {visiblePlaces.map((place) => (
              <option key={place.id} value={place.id}>
                {place.areaName} / {place.pointName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>使用アイテム</span>
          {setupPrimaryCandidates.length ? (
            <select value={primaryItemId} onChange={(event) => setPrimaryItemId(event.target.value)}>
              <option value="">未選択</option>
              {setupPrimaryCandidates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : (
            <EmptyState>このセットにはルアー / フライ / 毛鉤 / 餌が登録されていません。</EmptyState>
          )}
        </label>
      </section>

      <section className="panel">
        <h2>フラグ</h2>
        <div className="inline-actions">
          <button className={isFavorite ? "chip chip-active" : "chip"} type="button" onClick={() => setIsFavorite((current) => !current)}>
            {isFavorite ? "★ お気に入り中" : "☆ お気に入り"}
          </button>
          <button className={isMemorial ? "chip chip-active" : "chip"} type="button" onClick={() => setIsMemorial((current) => !current)}>
            {isMemorial ? "記念に設定中" : "記念"}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>魚写真</h2>
        {previewUrl ? (
          <button className="preview-button" type="button" onClick={() => setPreviewOpen(true)}>
            <img className="photo-preview" alt="差し替え予定の魚写真" src={previewUrl} />
          </button>
        ) : (
          <PhotoPreviewButton
            alt="既存の魚写真"
            className="photo-preview"
            media={removePhoto ? undefined : existingMedia}
            onOpen={!removePhoto && existingMedia ? () => setPreviewOpen(true) : undefined}
            placeholder="魚写真なし"
          />
        )}
        <label className="button button-secondary file-button">
          写真を差し替える
          <input accept="image/heic,image/heif,image/jpeg,image/png,image/*" type="file" onChange={(event) => selectPhoto(event.target.files?.[0])} />
        </label>
        <div className="action-row">
          <button
            className="button button-secondary button-compact"
            type="button"
            onClick={() => {
              setNewPhoto(undefined);
              setRemovePhoto(true);
            }}
          >
            写真を削除
          </button>
          <button
            className="button button-secondary button-compact"
            type="button"
            onClick={() => {
              setNewPhoto(undefined);
              setRemovePhoto(false);
            }}
          >
            変更を戻す
          </button>
        </div>
      </section>

      <FlashNotice message={message} />
      {error ? <p className="toast toast-error">{error}</p> : null}

      <button className="button button-primary" disabled={saving} type="button" onClick={save}>
        {saving ? "保存中..." : "保存する"}
      </button>

      {previewOpen ? (
        <>
          {previewUrl ? (
            <div aria-modal="true" className="modal-backdrop" role="dialog" onClick={() => setPreviewOpen(false)}>
              <div className="photo-modal" onClick={(event) => event.stopPropagation()}>
                <div className="photo-modal-header">
                  <h2>差し替え予定の写真</h2>
                  <button className="button button-secondary button-compact" type="button" onClick={() => setPreviewOpen(false)}>
                    閉じる
                  </button>
                </div>
                <img alt="差し替え予定の魚写真の拡大表示" className="photo-modal-image" src={previewUrl} />
              </div>
            </div>
          ) : (
            <PhotoModal alt="既存の魚写真" media={existingMedia} onClose={() => setPreviewOpen(false)} title="釣果写真" />
          )}
        </>
      ) : null}
    </main>
  );
}
