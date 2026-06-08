import type { FishingStyle, Item, ItemCategory, ItemKind, Place, Setup, SetupItemRole } from "./models";

export const primaryItemKinds: ItemKind[] = ["lure", "fly", "hook", "bait"];

export const orderedItemKinds: ItemKind[] = [
  "rod",
  "reel",
  "line",
  "leader",
  "lure",
  "fly",
  "hook",
  "bait",
  "net",
  "waders",
  "polarized_glasses",
  "other",
];

export const fishingStyleOptions: { id: FishingStyle; label: string }[] = [
  { id: "mountain_stream_bait", label: "渓流ベイト" },
  { id: "spinning", label: "スピニング" },
  { id: "fly", label: "フライ" },
  { id: "tenkara", label: "テンカラ" },
  { id: "bait_fishing", label: "餌釣り" },
  { id: "other", label: "その他" },
];

export function fishingStyleLabel(style: FishingStyle) {
  return fishingStyleOptions.find((option) => option.id === style)?.label ?? style;
}

export function itemKindLabel(kind: ItemKind) {
  return {
    rod: "ロッド",
    reel: "リール",
    line: "ライン",
    leader: "リーダー",
    lure: "ルアー",
    fly: "フライ",
    hook: "毛鉤",
    bait: "餌",
    net: "ネット",
    waders: "ウェーダー",
    polarized_glasses: "偏光グラス",
    other: "その他",
  }[kind];
}

export function preferredKindsForStyle(style: FishingStyle): ItemKind[] {
  switch (style) {
    case "tenkara":
      return ["rod", "line", "hook"];
    case "fly":
      return ["rod", "line", "fly"];
    case "mountain_stream_bait":
      return ["rod", "reel", "line", "leader", "lure"];
    case "spinning":
      return ["rod", "reel", "line", "leader", "lure"];
    case "bait_fishing":
      return ["rod", "line", "bait"];
    default:
      return ["rod", "reel", "line", "leader", "lure", "fly", "hook", "bait"];
  }
}

export function itemLabel(item: Item, categories: ItemCategory[]) {
  return categories.find((category) => category.id === item.categoryId)?.label ?? item.kind;
}

export type SetupItemView = Item & { role: SetupItemRole };

export function setupItems(setup: Setup | undefined, items: Item[]): SetupItemView[] {
  if (!setup) return [];
  return setup.items
    .map((entry) => {
      const item = items.find((candidate) => candidate.id === entry.itemId);
      return item ? { ...item, role: entry.role } : null;
    })
    .filter((item): item is SetupItemView => Boolean(item));
}

export function setupPrimaryItems(setup: Setup | undefined, items: Item[]) {
  return setupItems(setup, items).filter((item) => primaryItemKinds.includes(item.kind));
}

export function setupDisplayEntries(setup: Setup | undefined, items: Item[]) {
  const grouped = new Map<ItemKind, string[]>();
  setupItems(setup, items).forEach((item) => {
    const current = grouped.get(item.kind) ?? [];
    grouped.set(item.kind, [...current, item.name]);
  });

  return orderedItemKinds
    .map((kind) => {
      const names = grouped.get(kind);
      return names?.length ? { kind, label: itemKindLabel(kind), text: names.join(" / ") } : null;
    })
    .filter((entry): entry is { kind: ItemKind; label: string; text: string } => Boolean(entry));
}

export function placeLabel(place: Place) {
  return `${place.riverName} / ${place.areaName} / ${place.pointName}`;
}

export function uniqueRiverNames(places: Place[]) {
  return [...new Set(places.map((place) => place.riverName).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja-JP"));
}

export function sortPlacesForMvp(places: Place[]) {
  return [...places].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
    const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return placeLabel(a).localeCompare(placeLabel(b), "ja-JP");
  });
}

export function deletedSetupLabel() {
  return "削除済みセット";
}

export function deletedItemLabel() {
  return "削除済み装備";
}

export function nowIso() {
  return new Date().toISOString();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
