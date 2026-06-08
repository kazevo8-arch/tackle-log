import Dexie, { type Table } from "dexie";
import type { AppState, Item, ItemCategory, Media, Place, Result, Session, Setup } from "./models";

export class FishingLogDatabase extends Dexie {
  itemCategories!: Table<ItemCategory, string>;
  items!: Table<Item, string>;
  setups!: Table<Setup, string>;
  sessions!: Table<Session, string>;
  results!: Table<Result, string>;
  places!: Table<Place, string>;
  media!: Table<Media, string>;
  appState!: Table<AppState, string>;

  constructor() {
    super("fishing-log-web-pwa");

    this.version(1).stores({
      itemCategories: "&id, kind, sortOrder",
      items: "&id, categoryId, kind, updatedAt",
      setups: "&id, updatedAt",
      sessions: "&id, status, startedAt, endedAt, setupId, placeId",
      results: "&id, sessionId, setupId, placeId, primaryItemId, species, sizeCm, caughtAt",
      places: "&id, [riverName+areaName+pointName], isFavorite, lastUsedAt, updatedAt",
      media: "&id, mimeType, createdAt",
      appState: "&id, activeSessionId, currentSetupId, currentPlaceId",
    });

    this.version(2)
      .stores({
        itemCategories: "&id, kind, sortOrder",
        items: "&id, categoryId, kind, updatedAt",
        setups: "&id, updatedAt",
        sessions: "&id, status, startedAt, endedAt, setupId, placeId",
        results: "&id, sessionId, setupId, placeId, primaryItemId, *usedItemIds, species, sizeCm, caughtAt",
        places: "&id, [riverName+areaName+pointName], isFavorite, lastUsedAt, updatedAt",
        media: "&id, mimeType, createdAt",
        appState: "&id, activeSessionId, currentSetupId, currentPlaceId",
      })
      .upgrade(async (transaction) => {
        const results = transaction.table("results");
        await results.toCollection().modify((result) => {
          if (!Array.isArray(result.usedItemIds)) {
            result.usedItemIds = result.primaryItemId ? [result.primaryItemId] : [];
          }
        });
      });
  }
}

export const db = new FishingLogDatabase();
