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

    this.version(3)
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
        const items = transaction.table("items");
        const setups = transaction.table("setups");
        await items.toCollection().modify((item) => {
          if (!Array.isArray(item.fishingStyles)) {
            item.fishingStyles = item.kind === "fly" ? ["fly"] : item.kind === "hook" ? ["tenkara"] : item.kind === "bait" ? ["bait_fishing"] : item.kind === "lure" ? ["mountain_stream_bait", "spinning"] : ["other"];
          }
          if (!Array.isArray(item.tags)) {
            item.tags = [];
          }
        });
        await setups.toCollection().modify((setup) => {
          if (!setup.fishingStyle) {
            setup.fishingStyle = "other";
          }
        });
      });

    this.version(4)
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
          if (typeof result.isFavorite !== "boolean") {
            result.isFavorite = false;
          }
          if (typeof result.isMemorial !== "boolean") {
            result.isMemorial = false;
          }
        });
      });
  }
}

export const db = new FishingLogDatabase();
