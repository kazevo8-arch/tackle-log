import { useState } from "react";
import type { AppSnapshot } from "../App";
import { EmptyState, PhotoModal, PhotoPreviewButton, ScreenHeader } from "../components";
import { resultItemName, resultPointLabel, resultRiverName, resultSetupName } from "../domain";
import type { Media, Result } from "../models";

type ResultsViewProps = {
  snapshot: AppSnapshot;
  onAddResult: () => void;
  onEditResult: (resultId: string) => void;
  onToggleFavorite: (resultId: string) => void;
  onToggleMemorial: (resultId: string) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ResultCard({
  media,
  onEditResult,
  onOpenPhoto,
  onToggleFavorite,
  onToggleMemorial,
  result,
  snapshot,
}: {
  media?: Media;
  onEditResult: () => void;
  onOpenPhoto: () => void;
  onToggleFavorite: () => void;
  onToggleMemorial: () => void;
  result: Result;
  snapshot: AppSnapshot;
}) {
  return (
    <article className="result-card">
      <PhotoPreviewButton
        alt={`${result.species} の釣果写真`}
        className="result-thumb"
        media={media}
        onOpen={media ? onOpenPhoto : undefined}
        placeholder="魚写真なし"
      />
      <div className="result-body">
        <div className="result-heading">
          <h2>
            {result.species} {result.sizeCm}cm
          </h2>
          <div className="result-flags">
            {result.isFavorite ? <span className="badge">★ お気に入り</span> : null}
            {result.isMemorial ? <span className="badge badge-outline">記念</span> : null}
          </div>
        </div>
        <p>{formatDate(result.caughtAt)}</p>
        <p>{resultRiverName(result, snapshot.places)}</p>
        <p>{resultPointLabel(result, snapshot.places)}</p>
        <p>{resultSetupName(result, snapshot.setups)}</p>
        <p>{resultItemName(result, snapshot.items)}</p>
        <div className="inline-actions">
          <button className={result.isFavorite ? "chip chip-active" : "chip"} type="button" onClick={onToggleFavorite}>
            {result.isFavorite ? "★ お気に入り中" : "☆ お気に入り"}
          </button>
          <button className={result.isMemorial ? "chip chip-active" : "chip"} type="button" onClick={onToggleMemorial}>
            {result.isMemorial ? "記念に設定中" : "記念"}
          </button>
          <button className="chip" type="button" onClick={onEditResult}>
            編集
          </button>
          {media ? (
            <button className="chip" type="button" onClick={onOpenPhoto}>
              写真を開く
            </button>
          ) : (
            <span className="result-photo-note">写真なし</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResultsView({ snapshot, onAddResult, onEditResult, onToggleFavorite, onToggleMemorial }: ResultsViewProps) {
  const sortedResults = [...snapshot.results].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt));
  const [previewMedia, setPreviewMedia] = useState<Media | undefined>();

  return (
    <main className="screen-content">
      <ScreenHeader title="釣果一覧" description="釣れた魚を後から見返しやすくし、良い釣果をお気に入りや記念で残します。" />
      <button className="button button-primary" type="button" onClick={onAddResult}>
        ＋ 釣果を追加
      </button>

      {sortedResults.length ? (
        sortedResults.map((result) => {
          const media = snapshot.media.find((item) => item.id === result.fishMediaId);
          return (
            <ResultCard
              key={result.id}
              media={media}
              onEditResult={() => onEditResult(result.id)}
              onOpenPhoto={() => setPreviewMedia(media)}
              onToggleFavorite={() => onToggleFavorite(result.id)}
              onToggleMemorial={() => onToggleMemorial(result.id)}
              result={result}
              snapshot={snapshot}
            />
          );
        })
      ) : (
        <EmptyState>まだ釣果がありません。現場で釣れたら、まず1件追加して流れを確認してください。</EmptyState>
      )}

      {previewMedia ? <PhotoModal alt="釣果写真の拡大表示" media={previewMedia} onClose={() => setPreviewMedia(undefined)} title="釣果写真" /> : null}
    </main>
  );
}
