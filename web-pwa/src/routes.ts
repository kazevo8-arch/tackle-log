export type AppRoute =
  | "home"
  | "results"
  | "set-select"
  | "result-add"
  | "session-detail"
  | "items"
  | "item-edit"
  | "setups"
  | "setup-edit"
  | "rivers"
  | "places"
  | "place-edit"
  | "stats"
  | "settings";

export const routes: { id: AppRoute; label: string }[] = [
  { id: "home", label: "ホーム" },
  { id: "results", label: "釣果一覧" },
  { id: "set-select", label: "今日のセット選択" },
  { id: "result-add", label: "釣果追加" },
  { id: "session-detail", label: "釣行詳細" },
  { id: "items", label: "装備一覧" },
  { id: "item-edit", label: "装備編集" },
  { id: "setups", label: "セット一覧" },
  { id: "setup-edit", label: "セット編集" },
  { id: "rivers", label: "河川選択" },
  { id: "places", label: "場所管理" },
  { id: "place-edit", label: "ポイント編集" },
  { id: "stats", label: "実績" },
  { id: "settings", label: "設定/バックアップ" },
];
