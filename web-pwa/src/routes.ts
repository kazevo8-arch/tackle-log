export type AppRoute =
  | "home"
  | "set-select"
  | "result-add"
  | "session-detail"
  | "items"
  | "item-edit"
  | "setups"
  | "setup-edit"
  | "places"
  | "stats"
  | "settings";

export const routes: { id: AppRoute; label: string }[] = [
  { id: "home", label: "ホーム" },
  { id: "set-select", label: "今日のセット選択" },
  { id: "result-add", label: "釣果追加" },
  { id: "session-detail", label: "釣行詳細" },
  { id: "items", label: "装備一覧" },
  { id: "item-edit", label: "装備編集" },
  { id: "setups", label: "セット一覧" },
  { id: "setup-edit", label: "セット編集" },
  { id: "places", label: "場所管理" },
  { id: "stats", label: "実績" },
  { id: "settings", label: "設定/バックアップ" },
];
