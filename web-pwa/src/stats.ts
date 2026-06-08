import { deletedItemLabel, deletedSetupLabel, placeLabel, primaryItemKinds } from "./domain";
import type { Item, Place, Result, Setup } from "./models";

export type CountStat = {
  id: string;
  label: string;
  count: number;
  maxSize: number;
  lastCaughtAt?: string;
};

export type RecommendedItemStat = {
  itemId: string;
  itemName: string;
  count: number;
  maxSize: number;
};

export type PlaceRecommendationStat = {
  placeId: string;
  placeLabel: string;
  recommendations: RecommendedItemStat[];
};

function updateCountStat(map: Map<string, CountStat>, id: string, label: string, result: Result) {
  const current = map.get(id) ?? { id, label, count: 0, maxSize: 0, lastCaughtAt: undefined };
  current.count += 1;
  current.maxSize = Math.max(current.maxSize, result.sizeCm);
  if (!current.lastCaughtAt || result.caughtAt > current.lastCaughtAt) current.lastCaughtAt = result.caughtAt;
  map.set(id, current);
}

function sortedStats(map: Map<string, CountStat>) {
  return [...map.values()].sort((a, b) => b.count - a.count || b.maxSize - a.maxSize || a.label.localeCompare(b.label, "ja-JP"));
}

export function speciesStats(results: Result[]) {
  const map = new Map<string, CountStat>();
  results.forEach((result) => updateCountStat(map, result.species || "魚種未記録", result.species || "魚種未記録", result));
  return sortedStats(map);
}

export function setupStats(results: Result[], setups: Setup[]) {
  const map = new Map<string, CountStat>();
  results.forEach((result) => {
    const setup = setups.find((candidate) => candidate.id === result.setupId);
    updateCountStat(map, result.setupId, setup?.name ?? deletedSetupLabel(), result);
  });
  return sortedStats(map);
}

export function placeStats(results: Result[], places: Place[]) {
  const map = new Map<string, CountStat>();
  results.forEach((result) => {
    const place = places.find((candidate) => candidate.id === result.placeId);
    updateCountStat(map, result.placeId, place ? placeLabel(place) : "ポイント未記録", result);
  });
  return sortedStats(map);
}

export function itemStats(results: Result[], items: Item[]) {
  const map = new Map<string, CountStat>();
  results.forEach((result) => {
    const itemId = result.primaryItemId ?? result.usedItemIds.find((id) => primaryItemKinds.includes(items.find((item) => item.id === id)?.kind ?? "other"));
    if (!itemId) return;
    const item = items.find((candidate) => candidate.id === itemId);
    updateCountStat(map, itemId, item?.name ?? deletedItemLabel(), result);
  });
  return sortedStats(map);
}

export function placeRecommendedItems(results: Result[], places: Place[], items: Item[]) {
  return places
    .map((place): PlaceRecommendationStat => {
      const map = new Map<string, RecommendedItemStat>();
      results
        .filter((result) => result.placeId === place.id)
        .forEach((result) => {
          const itemId =
            result.primaryItemId ??
            result.usedItemIds.find((id) => {
              const item = items.find((candidate) => candidate.id === id);
              return item ? primaryItemKinds.includes(item.kind) : false;
            });
          if (!itemId) return;
          const item = items.find((candidate) => candidate.id === itemId);
          const current = map.get(itemId) ?? { itemId, itemName: item?.name ?? deletedItemLabel(), count: 0, maxSize: 0 };
          current.count += 1;
          current.maxSize = Math.max(current.maxSize, result.sizeCm);
          map.set(itemId, current);
        });
      return {
        placeId: place.id,
        placeLabel: place.pointName,
        recommendations: [...map.values()].sort((a, b) => b.count - a.count || b.maxSize - a.maxSize || a.itemName.localeCompare(b.itemName, "ja-JP")),
      };
    })
    .filter((place) => place.recommendations.length)
    .sort((a, b) => b.recommendations[0].count - a.recommendations[0].count || a.placeLabel.localeCompare(b.placeLabel, "ja-JP"));
}
