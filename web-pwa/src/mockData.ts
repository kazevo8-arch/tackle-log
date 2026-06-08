import { db } from "./db";
import type { AppState, Item, ItemCategory, Place, Result, Session, Setup } from "./models";

const now = "2026-06-08T08:30:00.000Z";

const categories: ItemCategory[] = [
  ["rod", "ロッド"],
  ["reel", "リール"],
  ["line", "ライン"],
  ["leader", "リーダー"],
  ["lure", "ルアー"],
  ["fly", "フライ"],
  ["hook", "毛鉤"],
  ["bait", "餌"],
  ["net", "ネット"],
  ["waders", "ウェーダー"],
  ["polarized_glasses", "偏光グラス"],
  ["other", "その他"],
].map(([kind, label], index) => ({
  id: `cat_${kind}`,
  kind: kind as ItemCategory["kind"],
  label,
  sortOrder: index + 1,
  createdAt: now,
  updatedAt: now,
}));

const items: Item[] = [
  { id: "item_rod_silver_creek", categoryId: "cat_rod", kind: "rod", name: "Silver Creek 51UL", note: "", fishingStyles: ["mountain_stream_bait", "spinning"], tags: ["渓流"], createdAt: now, updatedAt: now },
  { id: "item_reel_calcon_bfs", categoryId: "cat_reel", kind: "reel", name: "カルコンBFS", note: "", fishingStyles: ["mountain_stream_bait"], tags: ["BFS"], createdAt: now, updatedAt: now },
  { id: "item_line_pe06", categoryId: "cat_line", kind: "line", name: "PE0.6号", note: "", fishingStyles: ["mountain_stream_bait", "spinning"], tags: ["PE"], createdAt: now, updatedAt: now },
  { id: "item_leader_nylon6", categoryId: "cat_leader", kind: "leader", name: "ナイロン6lb", note: "", fishingStyles: ["mountain_stream_bait", "spinning"], tags: ["ナイロン"], createdAt: now, updatedAt: now },
  { id: "item_lure_dcompact38", categoryId: "cat_lure", kind: "lure", name: "D-Compact 38", note: "デイリー裏で実績", fishingStyles: ["mountain_stream_bait", "spinning"], tags: ["ミノー", "渓流"], createdAt: now, updatedAt: now },
  { id: "item_lure_emishi50s", categoryId: "cat_lure", kind: "lure", name: "蝦夷50S", note: "堰堤下で使う", fishingStyles: ["mountain_stream_bait", "spinning"], tags: ["ヘビーシンキング"], createdAt: now, updatedAt: now },
  { id: "item_fly_elk", categoryId: "cat_fly", kind: "fly", name: "エルクヘアカディス", note: "", fishingStyles: ["fly"], tags: ["ドライ"], createdAt: now, updatedAt: now },
];

const places: Place[] = [
  {
    id: "place_ayuzawa_daily",
    riverName: "鮎沢川",
    areaName: "上流",
    pointName: "デイリー裏",
    note: "朝だけ反応が良い",
    isFavorite: true,
    lastUsedAt: "2026-06-08T06:20:00.000Z",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "place_ayuzawa_weir",
    riverName: "鮎沢川",
    areaName: "上流",
    pointName: "2段堰堤",
    note: "水量がある日に入る",
    isFavorite: false,
    lastUsedAt: "2026-05-30T06:00:00.000Z",
    createdAt: now,
    updatedAt: now,
  },
];

const setups: Setup[] = [
  {
    id: "setup_stream_bait",
    name: "渓流ベイト",
    fishingStyle: "mountain_stream_bait",
    items: [
      { itemId: "item_rod_silver_creek", role: "rod" },
      { itemId: "item_reel_calcon_bfs", role: "reel" },
      { itemId: "item_line_pe06", role: "line" },
      { itemId: "item_leader_nylon6", role: "leader" },
      { itemId: "item_lure_dcompact38", role: "primary" },
      { itemId: "item_lure_emishi50s", role: "primary" },
    ],
    defaultPrimaryItemId: "item_lure_dcompact38",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "setup_fly_three",
    name: "フライ #3",
    fishingStyle: "fly",
    items: [
      { itemId: "item_fly_elk", role: "primary" },
    ],
    defaultPrimaryItemId: "item_fly_elk",
    createdAt: now,
    updatedAt: now,
  },
];

const sessions: Session[] = [
  {
    id: "session_active",
    title: "鮎沢川 上流",
    setupId: "setup_stream_bait",
    placeId: "place_ayuzawa_daily",
    currentPrimaryItemId: "item_lure_dcompact38",
    status: "active",
    startedAt: "2026-06-08T06:20:00.000Z",
    note: "",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "session_previous",
    title: "前回釣行",
    setupId: "setup_stream_bait",
    placeId: "place_ayuzawa_daily",
    currentPrimaryItemId: "item_lure_dcompact38",
    status: "finished",
    startedAt: "2026-06-01T06:20:00.000Z",
    endedAt: "2026-06-01T10:40:00.000Z",
    note: "",
    createdAt: now,
    updatedAt: now,
  },
];

const results: Result[] = [
  {
    id: "result_previous_42",
    sessionId: "session_previous",
    setupId: "setup_stream_bait",
    placeId: "place_ayuzawa_daily",
    primaryItemId: "item_lure_dcompact38",
    usedItemIds: [
      "item_rod_silver_creek",
      "item_reel_calcon_bfs",
      "item_line_pe06",
      "item_leader_nylon6",
      "item_lure_dcompact38",
    ],
    species: "ニジマス",
    sizeCm: 42,
    sceneryMediaIds: [],
    note: "",
    caughtAt: "2026-06-01T08:12:00.000Z",
    createdAt: now,
    updatedAt: now,
  },
];

const appState: AppState = {
  id: "main",
  currentSetupId: "setup_stream_bait",
  currentPrimaryItemId: "item_lure_dcompact38",
  currentPlaceId: "place_ayuzawa_daily",
  activeSessionId: "session_active",
  updatedAt: now,
};

export async function seedMockData() {
  const state = await db.appState.get("main");
  if (state) return;

  await db.transaction(
    "rw",
    [db.itemCategories, db.items, db.places, db.setups, db.sessions, db.results, db.appState],
    async () => {
      await db.itemCategories.bulkPut(categories);
      await db.items.bulkPut(items);
      await db.places.bulkPut(places);
      await db.setups.bulkPut(setups);
      await db.sessions.bulkPut(sessions);
      await db.results.bulkPut(results);
      await db.appState.put(appState);
    },
  );
}
