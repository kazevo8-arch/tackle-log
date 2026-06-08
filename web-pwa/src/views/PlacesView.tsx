import type { AppSnapshot } from "../App";
import { EmptyState, PhotoCard, ScreenHeader } from "../components";
import type { Place } from "../models";

type PlacesViewProps = {
  snapshot: AppSnapshot;
  onEditPlace: (placeId?: string) => void;
  onUsePlace: (placeId: string) => void;
};

function formatDate(value?: string) {
  if (!value) return "未使用";
  return new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function groupByRiverAndArea(places: Place[]) {
  const riverMap = new Map<string, Map<string, Place[]>>();

  places.forEach((place) => {
    const areaMap = riverMap.get(place.riverName) ?? new Map<string, Place[]>();
    const areaPlaces = areaMap.get(place.areaName) ?? [];
    areaMap.set(place.areaName, [...areaPlaces, place]);
    riverMap.set(place.riverName, areaMap);
  });

  return [...riverMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ja-JP"))
    .map(([riverName, areaMap]) => ({
      riverName,
      areas: [...areaMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b, "ja-JP"))
        .map(([areaName, areaPlaces]) => ({
          areaName,
          places: [...areaPlaces].sort((a, b) => a.pointName.localeCompare(b.pointName, "ja-JP")),
        })),
    }));
}

function PlaceSection({
  currentPlaceId,
  onEditPlace,
  onUsePlace,
  places,
  title,
}: {
  currentPlaceId?: string;
  onEditPlace: (placeId?: string) => void;
  onUsePlace: (placeId: string) => void;
  places: Place[];
  title: string;
}) {
  if (!places.length) return null;

  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="place-tree">
        {groupByRiverAndArea(places).map((river) => (
          <section className="river-group" key={river.riverName}>
            <h3>{river.riverName}</h3>
            {river.areas.map((area) => (
              <section className="area-group" key={`${river.riverName}-${area.areaName}`}>
                <h4>{area.areaName}</h4>
                {area.places.map((place) => (
                  <PhotoCard
                    key={place.id}
                    title={place.pointName}
                    photoLabel="ポイント"
                    badge={place.id === currentPlaceId ? "現在ポイント" : place.isFavorite ? "★ お気に入り" : undefined}
                    lines={[`最終使用 ${formatDate(place.lastUsedAt)}`, place.note || "メモなし"]}
                  >
                    <div className="action-row">
                      <button className="button button-primary button-compact" type="button" onClick={() => onUsePlace(place.id)}>
                        使う
                      </button>
                      <button className="button button-secondary button-compact" type="button" onClick={() => onEditPlace(place.id)}>
                        編集
                      </button>
                    </div>
                  </PhotoCard>
                ))}
              </section>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

export function PlacesView({ snapshot, onEditPlace, onUsePlace }: PlacesViewProps) {
  const favorites = snapshot.places
    .filter((place) => place.isFavorite)
    .sort((a, b) => (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? ""));
  const recent = snapshot.places
    .filter((place) => !place.isFavorite && place.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? ""));
  const others = snapshot.places
    .filter((place) => !place.isFavorite && !place.lastUsedAt)
    .sort((a, b) => a.riverName.localeCompare(b.riverName, "ja-JP") || a.areaName.localeCompare(b.areaName, "ja-JP"));

  return (
    <main className="screen-content">
      <ScreenHeader title="河川・ポイント管理" description="河川、エリア、ポイント名を登録し、今日の釣果へ自動反映します。" />
      <button className="button button-secondary" type="button" onClick={() => onEditPlace()}>
        ＋ ポイントを追加
      </button>

      {snapshot.places.length ? (
        <>
          <PlaceSection
            currentPlaceId={snapshot.appState?.currentPlaceId}
            onEditPlace={onEditPlace}
            onUsePlace={onUsePlace}
            places={favorites}
            title="1. お気に入り"
          />
          <PlaceSection
            currentPlaceId={snapshot.appState?.currentPlaceId}
            onEditPlace={onEditPlace}
            onUsePlace={onUsePlace}
            places={recent}
            title="2. 最近使用"
          />
          <PlaceSection
            currentPlaceId={snapshot.appState?.currentPlaceId}
            onEditPlace={onEditPlace}
            onUsePlace={onUsePlace}
            places={others}
            title="3. その他"
          />
        </>
      ) : (
        <EmptyState>ポイントがありません。最初の河川・エリア・ポイントを追加してください。</EmptyState>
      )}
    </main>
  );
}
