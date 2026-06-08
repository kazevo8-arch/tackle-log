import type { AppSnapshot } from "../App";
import { BlobImage, EmptyState, ScreenHeader } from "../components";
import { deletedItemLabel, deletedSetupLabel } from "../domain";

type ResultsViewProps = {
  snapshot: AppSnapshot;
  onAddResult: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ResultsView({ snapshot, onAddResult }: ResultsViewProps) {
  const sortedResults = [...snapshot.results].sort((a, b) => b.caughtAt.localeCompare(a.caughtAt));

  return (
    <main className="screen-content">
      <ScreenHeader title="釣果一覧" description="釣れた魚、場所、セット、使用中ルアーをあとから見返します。" />
      <button className="button button-primary" type="button" onClick={onAddResult}>
        ＋ 釣果を追加
      </button>

      {sortedResults.length ? (
        sortedResults.map((result) => {
          const media = snapshot.media.find((item) => item.id === result.fishMediaId);
          const place = snapshot.places.find((item) => item.id === result.placeId);
          const setup = snapshot.setups.find((item) => item.id === result.setupId);
          const primaryItem = snapshot.items.find((item) => item.id === result.primaryItemId);
          return (
            <article className="result-card" key={result.id}>
              <BlobImage alt="魚写真サムネイル" className="result-thumb" media={media} placeholder="魚写真なし" />
              <div className="result-body">
                <h2>
                  {result.species} {result.sizeCm}cm
                </h2>
                <p>{formatDate(result.caughtAt)}</p>
                <p>{place ? place.riverName : "河川未記録"}</p>
                <p>{place ? `${place.areaName} / ${place.pointName}` : "ポイント未記録"}</p>
                <p>{setup?.name ?? deletedSetupLabel()}</p>
                <p>{primaryItem?.name ?? deletedItemLabel()}</p>
              </div>
            </article>
          );
        })
      ) : (
        <EmptyState>まだ釣果がありません。最初の釣果を追加してください。</EmptyState>
      )}
    </main>
  );
}
