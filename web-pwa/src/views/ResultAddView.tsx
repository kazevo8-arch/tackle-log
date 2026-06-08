import { useEffect, useState } from "react";
import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";
import { db } from "../db";
import { nowIso, uid } from "../domain";
import { createMediaFromImage } from "../media";

type ResultAddViewProps = {
  snapshot: AppSnapshot;
  onRouteChange: (route: "home" | "places" | "set-select") => void;
  onSaved: () => void;
};

const speciesOptions = ["ニジマス", "ヤマメ", "アマゴ", "イワナ", "ブラウン", "その他"];
const sizePresets = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80];

export function ResultAddView({ snapshot, onRouteChange, onSaved }: ResultAddViewProps) {
  const appState = snapshot.appState;
  const currentSetup = snapshot.setups.find((setup) => setup.id === appState?.currentSetupId);
  const currentPlace = snapshot.places.find((place) => place.id === appState?.currentPlaceId);
  const currentPrimaryItem = snapshot.items.find((item) => item.id === appState?.currentPrimaryItemId);
  const activeSession = snapshot.sessions.find((session) => session.id === appState?.activeSessionId);

  const [species, setSpecies] = useState("ニジマス");
  const [sizeCm, setSizeCm] = useState(25);
  const [fishPhoto, setFishPhoto] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fishPhoto) {
      setPreviewUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(fishPhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fishPhoto]);

  function selectPhoto(file?: File) {
    setMessage(undefined);
    setError(undefined);
    if (!file) {
      setFishPhoto(undefined);
      return;
    }
    const lowerName = file.name.toLowerCase();
    if ([".dng", ".raw", ".arw", ".cr2", ".nef", ".orf", ".rw2"].some((extension) => lowerName.endsWith(extension))) {
      setFishPhoto(undefined);
      setError("DNG/RAW形式は非対応です。JPEG/PNG/HEICなどを選んでください。");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFishPhoto(undefined);
      setError("魚写真は画像ファイルを選んでください。");
      return;
    }
    setFishPhoto(file);
  }

  async function save() {
    setMessage(undefined);
    setError(undefined);

    if (!currentSetup) {
      setError("セット未選択です。先に今日のセットを選んでください。");
      return;
    }
    if (!currentPlace) {
      setError("ポイント未選択です。先にポイントを選んでください。");
      return;
    }
    if (!species.trim()) {
      setError("魚種を選んでください。");
      return;
    }
    if (!fishPhoto) {
      setError("魚写真を選んでください。");
      return;
    }

    setSaving(true);
    try {
      const createdAt = nowIso();
      const media = await createMediaFromImage(fishPhoto);
      const sessionId = activeSession?.id ?? uid("session");
      const sessionTitle = `${currentPlace.riverName} ${currentPlace.areaName}`;
      const resultId = uid("result");
      const usedItemIds = currentSetup.items.map((item) => item.itemId);

      await db.transaction("rw", [db.media, db.sessions, db.results, db.places, db.appState], async () => {
        await db.media.put(media);
        if (!activeSession) {
          await db.sessions.put({
            id: sessionId,
            title: sessionTitle,
            setupId: currentSetup.id,
            placeId: currentPlace.id,
            currentPrimaryItemId: currentPrimaryItem?.id,
            status: "active",
            startedAt: createdAt,
            note: "",
            createdAt,
            updatedAt: createdAt,
          });
          await db.appState.update("main", {
            activeSessionId: sessionId,
            updatedAt: createdAt,
          });
        }
        await db.results.put({
          id: resultId,
          sessionId,
          setupId: currentSetup.id,
          placeId: currentPlace.id,
          primaryItemId: currentPrimaryItem?.id,
          usedItemIds,
          species: species.trim(),
          sizeCm,
          fishMediaId: media.id,
          sceneryMediaIds: [],
          note: "",
          caughtAt: createdAt,
          createdAt,
          updatedAt: createdAt,
        });
        await db.places.update(currentPlace.id, {
          lastUsedAt: createdAt,
          updatedAt: createdAt,
        });
      });

      setMessage("保存しました");
      setFishPhoto(undefined);
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="screen-content">
      <ScreenHeader title="釣果を追加" description="魚種・サイズ・魚写真だけで、セットとポイント実績へ保存します。" />

      {!currentSetup ? (
        <section className="panel">
          <EmptyState>セット未選択です。釣果に装備実績を残すため、先に今日のセットを選んでください。</EmptyState>
          <button className="button button-primary" type="button" onClick={() => onRouteChange("set-select")}>
            今日のセットを選ぶ
          </button>
        </section>
      ) : null}

      {!currentPlace ? (
        <section className="panel">
          <EmptyState>ポイント未選択です。場所実績に反映するため、先にポイントを選んでください。</EmptyState>
          <button className="button button-primary" type="button" onClick={() => onRouteChange("places")}>
            ポイントを選択
          </button>
        </section>
      ) : null}

      <PhotoCard
        title={currentSetup?.name ?? "セット未選択"}
        photoLabel="自動"
        lines={[
          currentPrimaryItem ? `使用中 ${currentPrimaryItem.name}` : "使用中 未選択",
          currentPlace ? `${currentPlace.riverName} / ${currentPlace.areaName} / ${currentPlace.pointName}` : "ポイント未選択",
        ]}
      />

      <section className="panel">
        <h2>魚種</h2>
        <div className="chip-grid">
          {speciesOptions.map((option) => (
            <button
              key={option}
              className={species === option ? "chip chip-active" : "chip"}
              type="button"
              onClick={() => setSpecies(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>サイズ</h2>
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
      </section>

      <section className="panel">
        <h2>魚写真</h2>
        {previewUrl ? <img className="photo-preview" alt="選択中の魚写真" src={previewUrl} /> : <div className="large-photo-placeholder">魚写真を選択</div>}
        <label className="button button-secondary file-button">
          写真を選ぶ
          <input accept="image/*" type="file" onChange={(event) => selectPhoto(event.target.files?.[0])} />
        </label>
        {fishPhoto ? (
          <button className="button button-secondary" type="button" onClick={() => selectPhoto(undefined)}>
            写真を削除
          </button>
        ) : null}
      </section>

      {message ? <p className="toast toast-success">{message}</p> : null}
      {error ? <p className="toast toast-error">{error}</p> : null}

      <button className="button button-primary" disabled={saving} type="button" onClick={save}>
        {saving ? "保存中..." : "保存する"}
      </button>
      <button className="button button-secondary" type="button" onClick={() => onRouteChange("home")}>
        ホームへ戻る
      </button>
    </main>
  );
}
