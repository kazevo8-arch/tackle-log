import type { AppSnapshot } from "../App";
import { EmptyState, ScreenHeader } from "../components";
import { uniqueRiverNames } from "../domain";

type RiversViewProps = {
  snapshot: AppSnapshot;
  onAddPlace: () => void;
  onSelectRiver: (riverName: string) => void;
};

export function RiversView({ snapshot, onAddPlace, onSelectRiver }: RiversViewProps) {
  const rivers = uniqueRiverNames(snapshot.places);

  return (
    <main className="screen-content">
      <ScreenHeader title="河川一覧" description="河川を選んで、エリアとポイントへ進みます。" />
      <button className="button button-secondary" type="button" onClick={onAddPlace}>
        ＋ 新しい河川を追加
      </button>
      {rivers.length ? (
        rivers.map((riverName) => {
          const count = snapshot.places.filter((place) => place.riverName === riverName).length;
          return (
            <button key={riverName} className="river-card" type="button" onClick={() => onSelectRiver(riverName)}>
              <strong>{riverName}</strong>
              <span>{count}件のポイント</span>
            </button>
          );
        })
      ) : (
        <EmptyState>登録済みの河川はまだありません。最初の河川とポイントを追加してください。</EmptyState>
      )}
    </main>
  );
}
