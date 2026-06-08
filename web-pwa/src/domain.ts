import type { Item, ItemCategory, ItemKind, Setup, SetupItemRole } from "./models";

export const primaryItemKinds: ItemKind[] = ["lure", "fly", "hook", "bait"];

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

export function nowIso() {
  return new Date().toISOString();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
