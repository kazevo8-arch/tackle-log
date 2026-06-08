const STORAGE_KEY = "tackle-log-mvp-v2";
const PHOTO_DB_NAME = "tackle-log-photos";
const PHOTO_STORE_NAME = "photos";
const PHOTO_PREFIX = "idb:";
const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const TEXT = {
  noRecord: "未記録",
  monthSuffix: "月",
};

const previewConfig = getPreviewConfig();
const state = loadState();
let modal = null;
let toastTimer = null;
let toastMessage = "";
const photoObjectUrls = new Map();

boot();

function boot() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  render();
}

function getPreviewConfig() {
  const params = new URLSearchParams(window.location.search);
  return {
    active: params.get("preview") === "1",
    screen: params.get("screen") || "home",
  };
}

function buildPreviewState(config) {
  const createdAt = "2026-06-01T05:00:00.000Z";
  const sets = [
    {
      id: "set_stream_bait",
      name: "渓流ベイト",
      photo_path: "",
      created_at: createdAt,
      updated_at: "2026-06-08T06:00:00.000Z",
    },
    {
      id: "set_fly_three",
      name: "フライ #3",
      photo_path: "",
      created_at: createdAt,
      updated_at: "2026-06-05T06:00:00.000Z",
    },
  ];

  const gear = [
    { id: "gear_rod_kawasemi", type: "rod", name: "カワセミ 48UL", photo_path: "", created_at: createdAt },
    { id: "gear_reel_abu", type: "reel", name: "ABU 2500C", photo_path: "", created_at: createdAt },
    { id: "gear_line_pe", type: "line", name: "PE 0.6", photo_path: "", created_at: createdAt },
    { id: "gear_lure_shiden", type: "lure", name: "紫電 4g", photo_path: "", created_at: createdAt },
    { id: "gear_rod_fly", type: "rod", name: "Sage #3", photo_path: "", created_at: createdAt },
    { id: "gear_line_fly", type: "line", name: "DT3F", photo_path: "", created_at: createdAt },
    { id: "gear_fly_elk", type: "fly", name: "エルクヘアカディス", photo_path: "", created_at: createdAt },
  ];

  const setGear = [
    { id: "sg1", set_id: "set_stream_bait", gear_id: "gear_rod_kawasemi", role: "rod" },
    { id: "sg2", set_id: "set_stream_bait", gear_id: "gear_reel_abu", role: "reel" },
    { id: "sg3", set_id: "set_stream_bait", gear_id: "gear_line_pe", role: "line" },
    { id: "sg4", set_id: "set_stream_bait", gear_id: "gear_lure_shiden", role: "lure" },
    { id: "sg5", set_id: "set_fly_three", gear_id: "gear_rod_fly", role: "rod" },
    { id: "sg6", set_id: "set_fly_three", gear_id: "gear_line_fly", role: "line" },
    { id: "sg7", set_id: "set_fly_three", gear_id: "gear_fly_elk", role: "fly" },
  ];

  const catches = [
    {
      id: "c1",
      set_id: "set_stream_bait",
      species: "ニジマス",
      size_cm: 32,
      primary_gear_id: "gear_lure_shiden",
      photo_path: "",
      place_name: "鮎沢川",
      caught_at: "2026-06-08T04:50:00.000Z",
      created_at: "2026-06-08T04:50:00.000Z",
    },
    {
      id: "c2",
      set_id: "set_stream_bait",
      species: "ニジマス",
      size_cm: 42,
      primary_gear_id: "gear_lure_shiden",
      photo_path: "",
      place_name: "鮎沢川",
      caught_at: "2026-05-22T04:50:00.000Z",
      created_at: "2026-05-22T04:50:00.000Z",
    },
    {
      id: "c3",
      set_id: "set_stream_bait",
      species: "ヤマメ",
      size_cm: 24,
      primary_gear_id: "gear_lure_shiden",
      photo_path: "",
      place_name: "狩野川",
      caught_at: "2026-06-01T04:50:00.000Z",
      created_at: "2026-06-01T04:50:00.000Z",
    },
    {
      id: "c4",
      set_id: "set_fly_three",
      species: "イワナ",
      size_cm: 31,
      primary_gear_id: "gear_fly_elk",
      photo_path: "",
      place_name: "早川",
      caught_at: "2026-05-30T03:20:00.000Z",
      created_at: "2026-05-30T03:20:00.000Z",
    },
    {
      id: "c5",
      set_id: "set_fly_three",
      species: "ヤマメ",
      size_cm: 26,
      primary_gear_id: "gear_fly_elk",
      photo_path: "",
      place_name: "早川",
      caught_at: "2026-05-18T03:20:00.000Z",
      created_at: "2026-05-18T03:20:00.000Z",
    },
  ];

  const routeMap = {
    home: "home",
    setup: "setup",
    add: "add-catch",
    performance: "performance",
    set: "set-detail",
    gear: "gear-detail",
  };

  return {
    route: routeMap[config.screen] || "home",
    selectedSetId: "set_stream_bait",
    currentSetOrigin: "reuse",
    viewingSetId: "set_stream_bait",
    viewingGearId: "gear_lure_shiden",
    setupFilterGearId: null,
    onboarding: false,
    metrics: {
      setupSelections: 3,
      catchAdds: 5,
      performanceViews: 4,
      reuseClicks: 2,
      reusedSetCatchAdds: 1,
    },
    db: {
      sets,
      gear,
      setGear,
      catches,
    },
  };
}

function loadState() {
  if (previewConfig.active) {
    return buildPreviewState(previewConfig);
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  return {
    route: "home",
    selectedSetId: null,
    currentSetOrigin: "manual",
    viewingSetId: null,
    viewingGearId: null,
    setupFilterGearId: null,
    onboarding: true,
    metrics: {
      setupSelections: 0,
      catchAdds: 0,
      performanceViews: 0,
      reuseClicks: 0,
      reusedSetCatchAdds: 0,
    },
    db: {
      sets: [],
      gear: [],
      setGear: [],
      catches: [],
    },
  };
}

function persist() {
  if (previewConfig.active) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function openPhotoDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDBが使えません。"));
      return;
    }

    const request = indexedDB.open(PHOTO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("写真DBを開けませんでした。"));
  });
}

function photoKeyToId(path) {
  return String(path || "").startsWith(PHOTO_PREFIX) ? String(path).slice(PHOTO_PREFIX.length) : "";
}

function runPhotoStore(mode, callback) {
  return openPhotoDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, mode);
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = callback(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("写真保存に失敗しました。"));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error || new Error("写真保存に失敗しました。"));
        };
      }),
  );
}

function isDngFile(file) {
  const name = String(file?.name || "").toLowerCase();
  const type = String(file?.type || "").toLowerCase();
  return name.endsWith(".dng") || type.includes("dng") || type.includes("adobe");
}

function assertPhotoFile(file) {
  if (!file || file.size === 0) return;
  if (isDngFile(file)) {
    throw new Error("DNG写真はMVPでは保存できません。JPG、PNG、HEICを選んでください。");
  }
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("写真が大きすぎます。8MB以下の写真を選んでください。");
  }
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("画像ファイルを選んでください。");
  }
}

async function savePhotoFile(file) {
  if (!file || file.size === 0) return "";
  assertPhotoFile(file);
  const id = uid("photo");
  await runPhotoStore("readwrite", (store) =>
    store.put(
      {
        blob: file,
        name: file.name || "",
        type: file.type || "image/*",
        created_at: nowIso(),
      },
      id,
    ),
  );
  return `${PHOTO_PREFIX}${id}`;
}

async function loadPhotoUrl(path) {
  if (!path) return "";
  if (!String(path).startsWith(PHOTO_PREFIX)) return path;
  const id = photoKeyToId(path);
  if (!id) return "";
  if (photoObjectUrls.has(id)) return photoObjectUrls.get(id);
  const record = await runPhotoStore("readonly", (store) => store.get(id));
  const blob = record?.blob;
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  photoObjectUrls.set(id, url);
  return url;
}

async function deleteStoredPhoto(path) {
  const id = photoKeyToId(path);
  if (!id) return;
  await runPhotoStore("readwrite", (store) => store.delete(id));
  const url = photoObjectUrls.get(id);
  if (url) URL.revokeObjectURL(url);
  photoObjectUrls.delete(id);
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return TEXT.noRecord;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return TEXT.noRecord;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function monthName(value) {
  if (!value) return TEXT.noRecord;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return TEXT.noRecord;
  return `${date.getMonth() + 1}${TEXT.monthSuffix}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function countBy(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function topEntry(map) {
  const entries = Object.entries(map);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function getCurrentSet() {
  return state.db.sets.find((set) => set.id === state.selectedSetId) ?? null;
}

function getSetGear(setId) {
  return state.db.setGear
    .filter((link) => link.set_id === setId)
    .map((link) => {
      const gear = state.db.gear.find((item) => item.id === link.gear_id);
      return gear ? { ...gear, role: link.role } : null;
    })
    .filter(Boolean);
}

function getSetCatches(setId) {
  return state.db.catches
    .filter((item) => item.set_id === setId)
    .sort((a, b) => new Date(b.caught_at) - new Date(a.caught_at));
}

function summarizeSet(setId) {
  const catches = getSetCatches(setId);
  const sizes = catches.map((item) => item.size_cm).filter((value) => Number.isFinite(value));
  const speciesCount = countBy(catches.map((item) => item.species).filter(Boolean));
  const placeCount = countBy(catches.map((item) => item.place_name).filter(Boolean));

  return {
    totalCatches: catches.length,
    maxSize: sizes.length ? Math.max(...sizes) : null,
    favoriteSpecies: topEntry(speciesCount),
    favoritePlace: topEntry(placeCount),
    lastUsedAt: catches.length ? catches[0].caught_at : null,
    latestCatch: catches[0] ?? null,
  };
}

function sortCatchRows(a, b) {
  if ((b.totalCatches ?? 0) !== (a.totalCatches ?? 0)) {
    return (b.totalCatches ?? 0) - (a.totalCatches ?? 0);
  }
  return (b.maxSize ?? 0) - (a.maxSize ?? 0);
}

function computePerformance() {
  const setRows = state.db.sets
    .map((set) => {
      const summary = summarizeSet(set.id);
      return {
        id: set.id,
        name: set.name,
        totalCatches: summary.totalCatches,
        maxSize: summary.maxSize,
        lastUsedAt: summary.lastUsedAt,
        favoriteSpecies: summary.favoriteSpecies,
        favoritePlace: summary.favoritePlace,
        latestCatch: summary.latestCatch,
      };
    })
    .sort(sortCatchRows);

  const lureUsage = {};
  state.db.catches.forEach((item) => {
    if (!item.primary_gear_id) return;
    const gear = state.db.gear.find((entry) => entry.id === item.primary_gear_id);
    if (!gear) return;
    const existing = lureUsage[gear.id] ?? {
      id: gear.id,
      name: gear.name,
      totalCatches: 0,
      maxSize: null,
      lastUsedAt: null,
    };
    existing.totalCatches += 1;
    if (Number.isFinite(item.size_cm)) {
      existing.maxSize = existing.maxSize ? Math.max(existing.maxSize, item.size_cm) : item.size_cm;
    }
    if (!existing.lastUsedAt || existing.lastUsedAt < item.caught_at) {
      existing.lastUsedAt = item.caught_at;
    }
    lureUsage[gear.id] = existing;
  });
  const lureRows = Object.values(lureUsage).sort(sortCatchRows);

  const rodRows = state.db.gear
    .filter((gear) => gear.type === "rod")
    .map((gear) => {
      const linkedSetIds = state.db.setGear
        .filter((link) => link.gear_id === gear.id && link.role === "rod")
        .map((link) => link.set_id);
      const catches = state.db.catches.filter((item) => linkedSetIds.includes(item.set_id));
      const sizes = catches.map((item) => item.size_cm).filter((value) => Number.isFinite(value));
      return {
        id: gear.id,
        name: gear.name,
        totalCatches: catches.length,
        maxSize: sizes.length ? Math.max(...sizes) : null,
        lastUsedAt: catches.length ? catches.map((item) => item.caught_at).sort().slice(-1)[0] : null,
      };
    })
    .filter((row) => row.totalCatches > 0 || row.maxSize)
    .sort((a, b) => (b.maxSize ?? 0) - (a.maxSize ?? 0));

  const placeUsage = {};
  state.db.catches.forEach((item) => {
    if (!item.place_name) return;
    const existing = placeUsage[item.place_name] ?? {
      id: item.place_name,
      name: item.place_name,
      totalCatches: 0,
      maxSize: null,
      lastUsedAt: null,
    };
    existing.totalCatches += 1;
    if (Number.isFinite(item.size_cm)) {
      existing.maxSize = existing.maxSize ? Math.max(existing.maxSize, item.size_cm) : item.size_cm;
    }
    if (!existing.lastUsedAt || existing.lastUsedAt < item.caught_at) {
      existing.lastUsedAt = item.caught_at;
    }
    placeUsage[item.place_name] = existing;
  });
  const placeRows = Object.values(placeUsage).sort(sortCatchRows);

  return { setRows, lureRows, rodRows, placeRows };
}

function getBestReuseCandidate(performance) {
  return performance.setRows[0] ?? null;
}

function getSetById(setId) {
  return state.db.sets.find((set) => set.id === setId) ?? null;
}

function getGearById(gearId) {
  return state.db.gear.find((gear) => gear.id === gearId) ?? null;
}

function go(route) {
  if (route === "performance") {
    state.metrics.performanceViews += 1;
  }
  state.route = route;
  persist();
  render();
}

function showToast(message) {
  toastMessage = message;
  mountToast();
}

function mountToast() {
  const app = document.getElementById("app");
  if (!app) return;
  const previous = app.querySelector(".toast");
  if (previous) previous.remove();
  if (!toastMessage) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = toastMessage;
  app.appendChild(toast);
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastMessage = "";
    toast.remove();
  }, 2400);
}

function initials(value) {
  return value ? value.slice(0, 1) : "釣";
}

function photoMarkup(path, label) {
  if (path) {
    if (String(path).startsWith(PHOTO_PREFIX)) {
      return `<div class="photo photo-loading" data-photo-key="${escapeAttr(path)}">${escapeHtml(initials(label))}</div>`;
    }
    return `<div class="photo"><img src="${escapeAttr(path)}" alt="${escapeAttr(label)}" /></div>`;
  }
  return `<div class="photo">${escapeHtml(initials(label))}</div>`;
}

function hydratePhotos() {
  document.querySelectorAll("[data-photo-key]").forEach((element) => {
    const key = element.dataset.photoKey;
    loadPhotoUrl(key)
      .then((url) => {
        if (!url || !element.isConnected) return;
        element.classList.remove("photo-loading");
        element.innerHTML = `<img src="${escapeAttr(url)}" alt="写真" />`;
      })
      .catch(() => {
        if (!element.isConnected) return;
        element.classList.add("photo-error");
        element.title = "写真を読み込めませんでした";
      });
  });
}

function roleLabel(role) {
  const labels = {
    rod: "ロッド",
    reel: "リール",
    line: "ライン",
    leader: "リーダー",
    lure: "ルアー",
    fly: "フライ",
    hook: "毛鉤",
    bait: "餌",
    hook_bait: "毛鉤 / 餌",
    other: "その他",
  };
  return labels[role] ?? role;
}

function viewSet(setId) {
  state.viewingSetId = setId;
  state.route = "set-detail";
  persist();
  render();
}

function viewGear(gearId) {
  state.viewingGearId = gearId;
  state.route = "gear-detail";
  persist();
  render();
}

function setCurrentSet(setId, origin = "manual") {
  state.selectedSetId = setId;
  state.currentSetOrigin = origin;
  state.metrics.setupSelections += 1;
  if (origin === "reuse") {
    state.metrics.reuseClicks += 1;
  }
  persist();
  showToast(origin === "reuse" ? "前回の当たりセットを今日のセットにしました。" : "今日のセットを選びました。");
  go("home");
}

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const currentSet = getCurrentSet();
  const performance = computePerformance();

  app.innerHTML = `
    <div class="shell">
      <div class="page">
        ${renderScreen(currentSet, performance)}
      </div>
      ${renderNav()}
    </div>
    ${modal ? renderModal() : ""}
  `;

  bindEvents();
  hydratePhotos();
  mountToast();
}

function renderScreen(currentSet, performance) {
  if (state.onboarding || state.db.sets.length === 0) {
    return renderOnboarding();
  }

  switch (state.route) {
    case "setup":
      return renderSetupScreen(performance);
    case "add-catch":
      return renderAddCatch(currentSet);
    case "performance":
      return renderPerformance(performance);
    case "set-detail":
      return renderSetDetail();
    case "gear-detail":
      return renderGearDetail();
    default:
      return renderHome(currentSet, performance);
  }
}

function renderHeader(eyebrow, title, subtitle = "") {
  return `
    <div class="header">
      <div class="eyebrow">${escapeHtml(eyebrow)}</div>
      <h1 class="title">${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
    </div>
  `;
}

function renderHome(currentSet, performance) {
  if (!currentSet) {
    const recentSets = state.db.sets.slice(-3).reverse();
    return `
      ${renderHeader("ホーム", "前回よく釣れたセットを選ぶ", "このアプリの目的は、釣れたセットを次回の選択につなげることです。")}
      <div class="content stack">
        <button class="button button-primary" data-action="go-setup">今日のセットを選ぶ</button>
        <div class="panel">
          <h2 class="section-title">前回よく釣れたセット</h2>
          <div class="card-list">
            ${
              recentSets.length
                ? recentSets
                    .map((set) => {
                      const summary = summarizeSet(set.id);
                      return `
                        <button class="ranking-item" data-action="choose-set" data-set-id="${set.id}">
                          <div class="ranking-top">
                            <div class="ranking-name">${escapeHtml(set.name)}</div>
                            <div class="ranking-value">${summary.maxSize ? `${summary.maxSize}cm` : TEXT.noRecord}</div>
                          </div>
                          <div class="ranking-meta">釣果 ${summary.totalCatches}匹 / 最終使用 ${formatDate(summary.lastUsedAt)}</div>
                        </button>
                      `;
                    })
                    .join("")
                : `<div class="empty-state">まだセットがありません。</div>`
            }
          </div>
        </div>
      </div>
    `;
  }

  const currentSummary = summarizeSet(currentSet.id);
  const bestReuse = getBestReuseCandidate(performance);
  const bestSet = bestReuse ? getSetById(bestReuse.id) : currentSet;
  const recent = getSetCatches(currentSet.id).slice(0, 2);

  return `
    ${renderHeader("ホーム", "前回よく釣れたセット", "まず当たりセットを見て、そのまま釣果追加か再利用に進めます。")}
    <div class="content stack">
      ${
        bestReuse && bestSet
          ? `
            <div class="panel hero-stat">
              <div class="eyebrow">再利用候補</div>
              <div class="hero-name">前回 ${bestReuse.maxSize ? `${bestReuse.maxSize}cm` : "結果"} を釣ったセット</div>
              <div class="hero-meta">
                <div><strong>${escapeHtml(bestSet.name)}</strong></div>
                <div>釣果 ${bestReuse.totalCatches}匹 / 最終使用 ${formatDate(bestReuse.lastUsedAt)}</div>
                <div>${escapeHtml(bestReuse.favoriteSpecies || "魚種未記録")} / ${escapeHtml(bestReuse.favoritePlace || "場所未記録")}</div>
              </div>
              <button class="button button-primary button-inline" data-action="reuse-set" data-set-id="${bestSet.id}">このセットをもう一度使う</button>
            </div>
          `
          : ""
      }

      <div class="panel">
        <h2 class="section-title">現在のセット</h2>
        <div class="summary-list">
          <div class="summary-item"><span class="summary-key">セット名</span><span class="summary-value">${escapeHtml(currentSet.name)}</span></div>
          <div class="summary-item"><span class="summary-key">総釣果数</span><span class="summary-value">${currentSummary.totalCatches}匹</span></div>
          <div class="summary-item"><span class="summary-key">最大サイズ</span><span class="summary-value">${currentSummary.maxSize ? `${currentSummary.maxSize}cm` : TEXT.noRecord}</span></div>
          <div class="summary-item"><span class="summary-key">最終使用日</span><span class="summary-value">${formatDate(currentSummary.lastUsedAt)}</span></div>
        </div>
      </div>

      <button class="button button-primary" data-action="go-add-catch">釣果を追加</button>
      <button class="button button-secondary" data-action="go-performance">実績を見る</button>
      <button class="button button-ghost" data-action="go-setup">セットを変更</button>

      <div class="panel">
        <h2 class="section-title">最近釣れた魚</h2>
        <div class="ranking-list">
          ${
            recent.length
              ? recent
                  .map((item) => {
                    const gear = getGearById(item.primary_gear_id);
                    return `
                      <div class="history-item">
                        <div class="ranking-top">
                          <div class="ranking-name">${escapeHtml(item.species || "魚種未入力")}</div>
                          <div class="ranking-value">${item.size_cm ? `${item.size_cm}cm` : TEXT.noRecord}</div>
                        </div>
                        <div class="ranking-meta">${escapeHtml(gear?.name || "ルアー未選択")} / ${formatDate(item.caught_at)}</div>
                      </div>
                    `;
                  })
                  .join("")
              : `<div class="empty-state">まだ釣果がありません。まず1匹登録して、再利用の価値が出るかを見ます。</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderSetupScreen(performance) {
  const filterGearId = state.setupFilterGearId;
  const filterGear = filterGearId ? getGearById(filterGearId) : null;
  const sets = state.db.sets.filter((set) => {
    if (!filterGearId) return true;
    return state.db.setGear.some((link) => link.set_id === set.id && link.gear_id === filterGearId);
  });

  return `
    ${renderHeader("今日のセット", "最速でセットを選ぶ", filterGear ? `${filterGear.name} を使うセットだけを表示しています。` : "ここでは編集よりも選択速度を優先します。")}
    <div class="content stack">
      ${filterGear ? `<div class="top-note">フィルター中: ${escapeHtml(filterGear.name)} を含むセット</div>` : ""}
      <button class="button button-secondary" data-action="open-add-set">＋ 新しいセット</button>
      <div class="card-list">
        ${
          sets.length
            ? sets
                .map((set) => {
                  const gear = getSetGear(set.id).slice(0, 3);
                  const summary = summarizeSet(set.id);
                  return `
                    <div class="panel setup-card">
                      <div class="setup-hero">
                        ${photoMarkup(set.photo_path, set.name)}
                        <div>
                          <h2 class="setup-name">${escapeHtml(set.name)}</h2>
                          <p class="setup-gear">${escapeHtml(gear.map((item) => item.name).join(" / ") || "ロッドのみ")}</p>
                        </div>
                      </div>
                      <div class="summary-list">
                        <div class="summary-item"><span class="summary-key">釣果数</span><span class="summary-value">${summary.totalCatches}匹</span></div>
                        <div class="summary-item"><span class="summary-key">最大サイズ</span><span class="summary-value">${summary.maxSize ? `${summary.maxSize}cm` : TEXT.noRecord}</span></div>
                        <div class="summary-item"><span class="summary-key">最終使用日</span><span class="summary-value">${formatDate(summary.lastUsedAt)}</span></div>
                      </div>
                      <button class="button button-primary button-inline" data-action="choose-set" data-set-id="${set.id}">このセットを使う</button>
                      <div class="card-actions">
                        <button class="button button-ghost button-small" data-action="open-edit-set" data-set-id="${set.id}">編集</button>
                        <button class="button button-ghost button-small" data-action="duplicate-set" data-set-id="${set.id}">複製</button>
                        <button class="button button-ghost button-small button-danger" data-action="delete-set" data-set-id="${set.id}">削除</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<div class="panel empty-state">該当するセットがありません。</div>`
        }
      </div>

      <div class="panel">
        <h2 class="section-title">再利用候補</h2>
        <div class="ranking-list">
          ${
            performance.setRows.length
              ? performance.setRows
                  .slice(0, 3)
                  .map(
                    (row) => `
                      <button class="ranking-item" data-action="view-set" data-set-id="${row.id}">
                        <div class="ranking-top">
                          <div class="ranking-name">${escapeHtml(row.name)}</div>
                          <div class="ranking-value">${row.maxSize ? `${row.maxSize}cm` : TEXT.noRecord}</div>
                        </div>
                        <div class="ranking-meta">釣果 ${row.totalCatches}匹 / 最終使用 ${formatDate(row.lastUsedAt)}</div>
                      </button>
                    `,
                  )
                  .join("")
              : `<div class="empty-state">まだ再利用候補を出せる実績がありません。</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderAddCatch(currentSet) {
  if (!currentSet) {
    state.route = "setup";
    persist();
    return renderSetupScreen(computePerformance());
  }

  const setGear = getSetGear(currentSet.id);
  const primaryGearTypes = ["lure", "fly", "hook", "bait", "hook_bait"];
  const primaryOptions = setGear.filter((item) =>
    primaryGearTypes.includes(item.role) || primaryGearTypes.includes(item.type),
  );

  return `
    ${renderHeader("釣果追加", "30秒で記録する", `${currentSet.name} に紐づけて保存します。魚種もサイズも未入力で構いません。`)}
    <div class="content stack">
      <form id="catch-form" class="stack">
        <div class="panel">
          <p class="field-label">魚種</p>
          <div class="chip-grid">
            ${["ヤマメ", "アマゴ", "イワナ", "ニジマス", "その他"]
              .map((label) => `<button type="button" class="chip" data-action="species-preset" data-value="${label}">${label}</button>`)
              .join("")}
          </div>
          <input id="species-input" class="text-input" name="species" placeholder="魚種を入力しなくても保存できます" />
        </div>

        <div class="panel">
          <p class="field-label">サイズ</p>
          <div class="chip-grid">
            ${[20, 25, 30, 35, 40]
              .map((value) => `<button type="button" class="chip" data-action="size-preset" data-value="${value}">${value}</button>`)
              .join("")}
          </div>
          <div class="stepper" style="margin-top: 12px;">
            <button type="button" class="button button-secondary button-inline" data-action="size-step" data-step="-1">-1</button>
            <div id="size-display" class="stepper-value">32cm</div>
            <button type="button" class="button button-secondary button-inline" data-action="size-step" data-step="1">+1</button>
          </div>
          <input id="size-input" type="hidden" name="size_cm" value="32" />
          <p class="hint">サイズ未入力にしたい場合は保存前に消せます。</p>
          <button type="button" class="link-button" data-action="size-clear">サイズを消す</button>
        </div>

        <div class="panel">
          <p class="field-label">使用ルアー / フライ</p>
          <select id="gear-select" class="select-input" name="primary_gear_id">
            <option value="">選ばずに保存する</option>
            ${primaryOptions.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}
          </select>
          ${
            primaryOptions.length
              ? `<p class="hint">現在のセットに入っているものだけを表示しています。</p>`
              : `<p class="hint">まだルアーがありません。セット詳細から後で追加できます。</p>`
          }
        </div>

        <div class="panel">
          <p class="field-label">写真</p>
          <input id="photo-input" class="text-input" type="file" accept="image/*,.heic,.heif" />
          <button type="button" class="link-button" data-action="clear-file" data-input-id="photo-input">写真を削除</button>
          <p class="hint">写真なしでも保存できます。DNGはMVPでは非対応です。</p>
        </div>

        <button class="button button-primary" type="submit">保存する</button>
      </form>
    </div>
  `;
}

function renderPerformance(performance) {
  return `
    ${renderHeader("実績", "再利用候補", "この画面の最優先は分析ではなく、次に使うセットを決めることです。")}
    <div class="content stack">
      <div class="panel">
        <h2 class="section-title">再利用候補</h2>
        <div class="ranking-list">
          ${
            performance.setRows.length
              ? performance.setRows
                  .slice(0, 2)
                  .map(
                    (row) => `
                      <div class="ranking-item">
                        <button class="link-button" data-action="view-set" data-set-id="${row.id}">${escapeHtml(row.name)}</button>
                        <div class="ranking-top">
                          <div class="ranking-meta">最大 ${row.maxSize ? `${row.maxSize}cm` : TEXT.noRecord} / 最近 ${formatDate(row.lastUsedAt)}</div>
                          <div class="ranking-value">${row.totalCatches}匹</div>
                        </div>
                        <button class="button button-primary button-inline" data-action="reuse-set" data-set-id="${row.id}">このセットをもう一度使う</button>
                      </div>
                    `,
                  )
                  .join("")
              : `<div class="empty-state">まだ再利用候補を出せる実績がありません。</div>`
          }
        </div>
      </div>

      ${renderRankingSection("よく釣れるルアー", performance.lureRows, "gear")}
      ${renderRankingSection("ロッド別最大魚", performance.rodRows, "rod")}
      ${renderRankingSection("場所別実績", performance.placeRows, "place")}
    </div>
  `;
}

function renderRankingSection(title, rows, kind) {
  return `
    <div class="panel">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      <div class="ranking-list">
        ${rows.length ? rows.slice(0, 5).map((row) => renderRankingRow(row, kind)).join("") : `<div class="empty-state">まだ表示できる実績がありません。</div>`}
      </div>
    </div>
  `;
}

function renderRankingRow(row, kind) {
  if (kind === "gear" || kind === "rod") {
    return `
      <button class="ranking-item" data-action="view-gear" data-gear-id="${row.id}">
        <div class="ranking-top">
          <div class="ranking-name">${escapeHtml(row.name)}</div>
          <div class="ranking-value">${row.maxSize ? `${row.maxSize}cm` : TEXT.noRecord}</div>
        </div>
        <div class="ranking-meta">釣果 ${row.totalCatches ?? 0}匹</div>
      </button>
    `;
  }

  return `
    <div class="ranking-item">
      <div class="ranking-top">
        <div class="ranking-name">${escapeHtml(row.name)}</div>
        <div class="ranking-value">${row.maxSize ? `${row.maxSize}cm` : TEXT.noRecord}</div>
      </div>
      <div class="ranking-meta">釣果 ${row.totalCatches ?? 0}匹 / 最終使用 ${formatDate(row.lastUsedAt)}</div>
    </div>
  `;
}

function renderSetDetail() {
  const set = getSetById(state.viewingSetId) ?? getCurrentSet();
  if (!set) {
    go("home");
    return "";
  }

  const summary = summarizeSet(set.id);
  const gear = getSetGear(set.id);
  const recentCatches = getSetCatches(set.id).slice(0, 3);

  return `
    ${renderHeader("セット詳細", set.name, "このセットがまた使いたくなるかを、最大魚と最近の釣果から先に確認します。")}
    <div class="content stack">
      <button class="link-button back-button" data-action="back-to-setup">← 戻る</button>
      <div class="panel">
        <h2 class="section-title">最大魚</h2>
        <div class="hero-meta">
          <div><strong>${summary.maxSize ? `${summary.maxSize}cm` : TEXT.noRecord}</strong></div>
          <div>${escapeHtml(summary.favoriteSpecies || "魚種未記録")} / ${escapeHtml(summary.favoritePlace || "場所未記録")}</div>
        </div>
      </div>

      <div class="panel">
        <h2 class="section-title">最近釣れた魚</h2>
        <div class="ranking-list">
          ${
            recentCatches.length
              ? recentCatches
                  .map((item) => `
                    <div class="history-item history-with-photo">
                      ${photoMarkup(item.photo_path, item.species || "釣果")}
                      <div>
                        <div class="ranking-top">
                          <div class="ranking-name">${escapeHtml(item.species || "魚種未入力")}</div>
                          <div class="ranking-value">${item.size_cm ? `${item.size_cm}cm` : TEXT.noRecord}</div>
                        </div>
                        <div class="ranking-meta">${formatDate(item.caught_at)}</div>
                      </div>
                    </div>
                  `)
                  .join("")
              : `<div class="empty-state">まだ最近の釣果はありません。</div>`
          }
        </div>
      </div>

      <div class="panel">
        <h2 class="section-title">セットの実績</h2>
        <div class="summary-list">
          <div class="summary-item"><span class="summary-key">総釣果数</span><span class="summary-value">${summary.totalCatches}匹</span></div>
          <div class="summary-item"><span class="summary-key">主な魚種</span><span class="summary-value">${escapeHtml(summary.favoriteSpecies || TEXT.noRecord)}</span></div>
          <div class="summary-item"><span class="summary-key">主な場所</span><span class="summary-value">${escapeHtml(summary.favoritePlace || TEXT.noRecord)}</span></div>
        </div>
      </div>

      <div class="panel">
        <h2 class="section-title">構成装備</h2>
        <div class="ranking-list">
          ${
            gear.length
              ? gear
                  .map(
                    (item) => `
                      <button class="gear-row" data-action="view-gear" data-gear-id="${item.id}">
                        <div class="ranking-top">
                          <div class="ranking-name">${escapeHtml(roleLabel(item.role))}</div>
                          <div class="ranking-value">${escapeHtml(item.name)}</div>
                        </div>
                      </button>
                    `,
                  )
                  .join("")
              : `<div class="empty-state">まだロッド以外の装備がありません。</div>`
          }
        </div>
        <button class="button button-secondary button-inline" style="margin-top: 12px;" data-action="open-add-gear" data-set-id="${set.id}">装備を追加する</button>
      </div>

      <div class="button-sticky-wrap">
        <button class="button button-primary" data-action="reuse-set" data-set-id="${set.id}">このセットをもう一度使う</button>
      </div>
    </div>
  `;
}

function renderGearDetail() {
  const gear = getGearById(state.viewingGearId);
  if (!gear) {
    go("performance");
    return "";
  }

  const catches = state.db.catches
    .filter((item) => item.primary_gear_id === gear.id || isRodLinkedCatch(gear.id, item.set_id))
    .sort((a, b) => new Date(b.caught_at) - new Date(a.caught_at));
  const sizes = catches.map((item) => item.size_cm).filter((value) => Number.isFinite(value));
  const monthCounts = countBy(catches.map((item) => monthName(item.caught_at)).filter((value) => value !== TEXT.noRecord));
  const setupCounts = countBy(
    catches
      .map((item) => getSetById(item.set_id)?.name)
      .filter(Boolean),
  );

  return `
    ${renderHeader("道具詳細", gear.name, "この道具がどのセットの再利用につながるかを確認します。")}
    <div class="content stack">
      <button class="link-button back-button" data-action="back-to-performance">← 戻る</button>
      <div class="panel">
        <div class="setup-hero" style="margin-bottom: 12px;">
          ${photoMarkup(gear.photo_path, gear.name)}
          <div>
            <h2 class="setup-name">${escapeHtml(gear.name)}</h2>
            <p class="setup-gear">${escapeHtml(roleLabel(gear.type))}</p>
          </div>
        </div>
        ${
          gear.photo_path
            ? `<button class="link-button" data-action="remove-gear-photo" data-gear-id="${gear.id}">写真を削除</button>`
            : ""
        }
        <div class="summary-list">
          <div class="summary-item"><span class="summary-key">釣果数</span><span class="summary-value">${catches.length}匹</span></div>
          <div class="summary-item"><span class="summary-key">最大サイズ</span><span class="summary-value">${sizes.length ? `${Math.max(...sizes)}cm` : TEXT.noRecord}</span></div>
          <div class="summary-item"><span class="summary-key">よく釣れる月</span><span class="summary-value">${escapeHtml(topEntry(monthCounts) || TEXT.noRecord)}</span></div>
          <div class="summary-item"><span class="summary-key">よく使うセット</span><span class="summary-value">${escapeHtml(topEntry(setupCounts) || TEXT.noRecord)}</span></div>
        </div>
      </div>

      <div class="panel">
        <h2 class="section-title">最近の釣果</h2>
        <div class="ranking-list">
          ${
            catches.length
              ? catches
                  .slice(0, 5)
                  .map(
                    (item) => `
                      <div class="history-item">
                        <div class="history-with-photo">
                          ${photoMarkup(item.photo_path, item.species || "釣果")}
                          <div>
                            <div class="ranking-top">
                              <div class="ranking-name">${escapeHtml(item.species || "魚種未入力")}</div>
                              <div class="ranking-value">${item.size_cm ? `${item.size_cm}cm` : TEXT.noRecord}</div>
                            </div>
                            <div class="ranking-meta">${formatDate(item.caught_at)} / ${escapeHtml(getSetById(item.set_id)?.name || "")}</div>
                          </div>
                        </div>
                      </div>
                    `,
                  )
                  .join("")
              : `<div class="empty-state">まだこの道具の釣果がありません。</div>`
          }
        </div>
      </div>

      <button class="button button-primary" data-action="filter-setups-by-gear" data-gear-id="${gear.id}">この道具を使うセットを見る</button>
    </div>
  `;
}

function isRodLinkedCatch(gearId, setId) {
  return state.db.setGear.some((link) => link.gear_id === gearId && link.set_id === setId);
}

function renderOnboarding() {
  return `
    ${renderHeader("初回設定", "最初のセットを作る", "最初はセット名とロッド名だけで始めます。ほかの装備は後から追加できます。")}
    <div class="content stack">
      <form id="onboarding-form" class="stack">
        <div class="panel field-grid">
          <div>
            <p class="field-label">セット名</p>
            <input class="text-input" name="set_name" placeholder="例: 渓流ベイト" required />
          </div>
          <div>
            <p class="field-label">ロッド名</p>
            <input class="text-input" name="rod_name" placeholder="例: カワセミ 48UL" required />
          </div>
        </div>
        <button class="button button-primary" type="submit">はじめる</button>
      </form>
    </div>
  `;
}

function renderNav() {
  if (state.onboarding || state.db.sets.length === 0) return "";
  const route = state.route;
  const items = [
    { key: "home", label: "ホーム" },
    { key: "setup", label: "セット" },
    { key: "add-catch", label: "釣果", primary: true },
    { key: "performance", label: "実績" },
  ];

  return `
    <div class="nav">
      ${items
        .map((item) => {
          const active =
            item.key === route ||
            (item.key === "setup" && route === "set-detail") ||
            (item.key === "performance" && route === "gear-detail");
          return `
            <button
              class="nav-button ${active ? "nav-button-active" : ""} ${item.primary ? "nav-button-primary" : ""}"
              data-action="nav"
              data-route="${item.key}"
            >
              ${item.label}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderModal() {
  if (modal?.type === "add-gear") {
    return `
      <div class="sheet-backdrop" data-action="close-modal">
        <div class="sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
          <h2 class="sheet-title">装備を追加する</h2>
          <form id="add-gear-form" class="field-grid">
            <div>
              <p class="field-label">登録済み装備から追加</p>
              <select class="select-input" name="existing_gear_id">
                <option value="">新しい装備を登録する</option>
                ${state.db.gear
                  .map((gear) => `<option value="${gear.id}">${escapeHtml(roleLabel(gear.type))}: ${escapeHtml(gear.name)}</option>`)
                  .join("")}
              </select>
            </div>
            <select class="select-input" name="role" required>
              <option value="rod">ロッド</option>
              <option value="reel">リール</option>
              <option value="line">ライン</option>
              <option value="leader">リーダー</option>
              <option value="lure">ルアー</option>
              <option value="fly">フライ</option>
              <option value="hook">毛鉤</option>
              <option value="bait">餌</option>
              <option value="other">その他</option>
            </select>
            <input class="text-input" name="name" placeholder="新しい装備名" />
            <input id="gear-photo-input" class="text-input" type="file" name="photo" accept="image/*,.heic,.heif" />
            <button type="button" class="link-button" data-action="clear-file" data-input-id="gear-photo-input">写真を削除</button>
            <p class="hint">DNGはMVPでは保存できません。JPG、PNG、HEICを選んでください。</p>
            <div class="sheet-actions">
              <button class="button button-primary" type="submit">追加する</button>
              <button class="button button-ghost sheet-close" type="button" data-action="close-modal">閉じる</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (modal?.type === "add-set" || modal?.type === "edit-set") {
    const set = modal.type === "edit-set" ? getSetById(modal.setId) : null;
    return `
      <div class="sheet-backdrop" data-action="close-modal">
        <div class="sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
          <h2 class="sheet-title">${modal.type === "edit-set" ? "セットを編集する" : "新しいセットを作る"}</h2>
          <form id="set-form" class="field-grid">
            <input type="hidden" name="set_id" value="${escapeAttr(set?.id || "")}" />
            <div>
              <p class="field-label">セット名</p>
              <input class="text-input" name="set_name" value="${escapeAttr(set?.name || "")}" placeholder="例: 渓流ベイト2026" required />
            </div>
            <div>
              <p class="field-label">ロッド名</p>
              <input class="text-input" name="rod_name" placeholder="新規作成時だけ入力" ${modal.type === "add-set" ? "required" : ""} />
            </div>
            <div>
              <p class="field-label">セット写真</p>
              <input id="set-photo-input" class="text-input" type="file" name="photo" accept="image/*,.heic,.heif" />
              <button type="button" class="link-button" data-action="clear-file" data-input-id="set-photo-input">写真を削除</button>
              ${
                set?.photo_path
                  ? `<button type="button" class="link-button" data-action="remove-set-photo" data-set-id="${set.id}">保存済み写真を削除</button>`
                  : ""
              }
              <p class="hint">写真なしでも保存できます。DNGはMVPでは非対応です。</p>
            </div>
            <div class="sheet-actions">
              <button class="button button-primary" type="submit">保存する</button>
              <button class="button button-ghost sheet-close" type="button" data-action="close-modal">閉じる</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return "";
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", handleAction);
  });

  const onboardingForm = document.getElementById("onboarding-form");
  if (onboardingForm) onboardingForm.addEventListener("submit", handleOnboardingSubmit);

  const catchForm = document.getElementById("catch-form");
  if (catchForm) catchForm.addEventListener("submit", handleCatchSubmit);

  const addGearForm = document.getElementById("add-gear-form");
  if (addGearForm) addGearForm.addEventListener("submit", handleAddGearSubmit);

  const setForm = document.getElementById("set-form");
  if (setForm) setForm.addEventListener("submit", handleSetSubmit);
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;

  if (action === "go-setup") {
    state.setupFilterGearId = null;
    go("setup");
    return;
  }

  if (action === "go-add-catch") {
    if (!state.selectedSetId) {
      state.setupFilterGearId = null;
      go("setup");
      return;
    }
    go("add-catch");
    return;
  }

  if (action === "go-performance") {
    go("performance");
    return;
  }

  if (action === "nav") {
    const route = event.currentTarget.dataset.route;
    if (route === "add-catch" && !state.selectedSetId) {
      state.setupFilterGearId = null;
      go("setup");
      return;
    }
    if (route === "setup") {
      state.setupFilterGearId = null;
    }
    go(route);
    return;
  }

  if (action === "choose-set") {
    state.setupFilterGearId = null;
    setCurrentSet(event.currentTarget.dataset.setId, "manual");
    return;
  }

  if (action === "reuse-set") {
    state.setupFilterGearId = null;
    setCurrentSet(event.currentTarget.dataset.setId, "reuse");
    return;
  }

  if (action === "view-set") {
    viewSet(event.currentTarget.dataset.setId);
    return;
  }

  if (action === "view-gear") {
    viewGear(event.currentTarget.dataset.gearId);
    return;
  }

  if (action === "filter-setups-by-gear") {
    state.setupFilterGearId = event.currentTarget.dataset.gearId;
    persist();
    go("setup");
    return;
  }

  if (action === "species-preset") {
    const input = document.getElementById("species-input");
    if (input) input.value = event.currentTarget.dataset.value;
    document.querySelectorAll('[data-action="species-preset"]').forEach((button) => {
      button.classList.toggle("chip-active", button === event.currentTarget);
    });
    return;
  }

  if (action === "size-preset") {
    updateSizeDisplay(Number(event.currentTarget.dataset.value));
    document.querySelectorAll('[data-action="size-preset"]').forEach((button) => {
      button.classList.toggle("chip-active", button === event.currentTarget);
    });
    return;
  }

  if (action === "size-step") {
    const input = document.getElementById("size-input");
    const current = input?.value ? Number(input.value) : 0;
    updateSizeDisplay(Math.max(0, current + Number(event.currentTarget.dataset.step)));
    return;
  }

  if (action === "size-clear") {
    const input = document.getElementById("size-input");
    const display = document.getElementById("size-display");
    if (input) input.value = "";
    if (display) display.textContent = TEXT.noRecord;
    return;
  }

  if (action === "clear-file") {
    const input = document.getElementById(event.currentTarget.dataset.inputId);
    if (input) input.value = "";
    showToast("写真を未選択に戻しました。");
    return;
  }

  if (action === "open-add-gear") {
    modal = { type: "add-gear", setId: event.currentTarget.dataset.setId };
    render();
    return;
  }

  if (action === "open-add-set") {
    modal = { type: "add-set" };
    render();
    return;
  }

  if (action === "open-edit-set") {
    modal = { type: "edit-set", setId: event.currentTarget.dataset.setId };
    render();
    return;
  }

  if (action === "duplicate-set") {
    duplicateSet(event.currentTarget.dataset.setId);
    return;
  }

  if (action === "delete-set") {
    deleteSet(event.currentTarget.dataset.setId);
    return;
  }

  if (action === "remove-set-photo") {
    removeSetPhoto(event.currentTarget.dataset.setId);
    return;
  }

  if (action === "remove-gear-photo") {
    removeGearPhoto(event.currentTarget.dataset.gearId);
    return;
  }

  if (action === "back-to-setup") {
    go("setup");
    return;
  }

  if (action === "back-to-performance") {
    go("performance");
    return;
  }

  if (action === "close-modal") {
    modal = null;
    render();
  }
}

function updateSizeDisplay(value) {
  const input = document.getElementById("size-input");
  const display = document.getElementById("size-display");
  if (input) input.value = String(value);
  if (display) display.textContent = `${value}cm`;
}

function handleOnboardingSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const setName = String(form.get("set_name") || "").trim();
  const rodName = String(form.get("rod_name") || "").trim();
  if (!setName || !rodName) return;

  const setId = uid("set");
  const rodId = uid("gear");
  const createdAt = nowIso();

  state.db.sets.push({
    id: setId,
    name: setName,
    photo_path: "",
    created_at: createdAt,
    updated_at: createdAt,
  });
  state.db.gear.push({
    id: rodId,
    type: "rod",
    name: rodName,
    photo_path: "",
    created_at: createdAt,
  });
  state.db.setGear.push({
    id: uid("setgear"),
    set_id: setId,
    gear_id: rodId,
    role: "rod",
  });

  state.onboarding = false;
  state.selectedSetId = setId;
  state.currentSetOrigin = "initial";
  state.metrics.setupSelections += 1;
  state.route = "home";
  persist();
  showToast("最初のセットを作成しました。");
  render();
}

async function handleCatchSubmit(event) {
  event.preventDefault();
  if (!state.selectedSetId) {
    state.route = "setup";
    persist();
    render();
    return;
  }

  const form = event.currentTarget;
  const species = form.querySelector('[name="species"]').value.trim();
  const sizeValue = form.querySelector('[name="size_cm"]').value;
  const gearId = form.querySelector('[name="primary_gear_id"]').value;
  const photoFile = form.querySelector("#photo-input")?.files?.[0];
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;

  try {
    const photoPath = await savePhotoFile(photoFile);
    state.db.catches.push({
      id: uid("catch"),
      set_id: state.selectedSetId,
      species: species || "",
      size_cm: sizeValue ? Number(sizeValue) : null,
      primary_gear_id: gearId || "",
      photo_path: photoPath,
      place_name: "",
      caught_at: nowIso(),
      created_at: nowIso(),
    });
    state.metrics.catchAdds += 1;
    if (state.currentSetOrigin === "reuse") {
      state.metrics.reusedSetCatchAdds += 1;
    }
    persist();
    go("performance");
    showToast("保存しました");
  } catch (error) {
    showToast(error?.message || "保存に失敗しました");
    if (submit) submit.disabled = false;
  }
}

async function handleAddGearSubmit(event) {
  event.preventDefault();
  if (!modal?.setId) return;

  const form = new FormData(event.currentTarget);
  const role = String(form.get("role") || "");
  const existingGearId = String(form.get("existing_gear_id") || "");
  const name = String(form.get("name") || "").trim();
  const photo = form.get("photo");
  if (!role) return;
  if (!existingGearId && !name) {
    showToast("装備名を入力してください");
    return;
  }
  const setId = modal.setId;
  const submit = event.currentTarget.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;

  try {
    if (existingGearId) {
      const existingGear = getGearById(existingGearId);
      if (!existingGear) throw new Error("登録済み装備が見つかりません。");
      const alreadyLinked = state.db.setGear.some((link) => link.set_id === setId && link.gear_id === existingGearId);
      if (alreadyLinked) throw new Error("この装備はすでにセットに入っています。");
      state.db.setGear.push({
        id: uid("setgear"),
        set_id: setId,
        gear_id: existingGearId,
        role: existingGear.type || role,
      });
      const set = getSetById(setId);
      if (set) set.updated_at = nowIso();
      modal = null;
      persist();
      render();
      showToast("保存しました");
      return;
    }

    const photoPath = photo instanceof File && photo.size > 0 ? await savePhotoFile(photo) : "";
    const gearId = uid("gear");
    state.db.gear.push({
      id: gearId,
      type: role,
      name,
      photo_path: photoPath,
      created_at: nowIso(),
    });
    state.db.setGear.push({
      id: uid("setgear"),
      set_id: setId,
      gear_id: gearId,
      role,
    });
    const set = getSetById(setId);
    if (set) set.updated_at = nowIso();
    modal = null;
    persist();
    render();
    showToast("保存しました");
  } catch (error) {
    showToast(error?.message || "保存に失敗しました");
    if (submit) submit.disabled = false;
  }
}

async function handleSetSubmit(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const setName = String(form.get("set_name") || "").trim();
  const rodName = String(form.get("rod_name") || "").trim();
  const photo = form.get("photo");
  const submit = formElement.querySelector('[type="submit"]');
  if (!setName) return;
  if (modal?.type === "add-set" && !rodName) return;
  if (submit) submit.disabled = true;

  try {
    const photoPath = photo instanceof File && photo.size > 0 ? await savePhotoFile(photo) : "";
    const updatedAt = nowIso();

    if (modal?.type === "edit-set") {
      const set = getSetById(String(form.get("set_id") || ""));
      if (!set) throw new Error("セットが見つかりません。");
      set.name = setName;
      if (photoPath) set.photo_path = photoPath;
      set.updated_at = updatedAt;
    } else {
      const setId = uid("set");
      const rodId = uid("gear");
      state.db.sets.push({
        id: setId,
        name: setName,
        photo_path: photoPath,
        created_at: updatedAt,
        updated_at: updatedAt,
      });
      state.db.gear.push({
        id: rodId,
        type: "rod",
        name: rodName,
        photo_path: "",
        created_at: updatedAt,
      });
      state.db.setGear.push({
        id: uid("setgear"),
        set_id: setId,
        gear_id: rodId,
        role: "rod",
      });
      state.selectedSetId = setId;
      state.currentSetOrigin = "manual";
    }

    modal = null;
    persist();
    render();
    showToast("保存しました");
  } catch (error) {
    showToast(error?.message || "保存に失敗しました");
    if (submit) submit.disabled = false;
  }
}

function duplicateSet(setId) {
  const source = getSetById(setId);
  if (!source) {
    showToast("保存に失敗しました");
    return;
  }

  const newSetId = uid("set");
  const createdAt = nowIso();
  state.db.sets.push({
    id: newSetId,
    name: `${source.name} コピー`,
    photo_path: source.photo_path,
    created_at: createdAt,
    updated_at: createdAt,
  });
  state.db.setGear
    .filter((link) => link.set_id === source.id)
    .forEach((link) => {
      state.db.setGear.push({
        id: uid("setgear"),
        set_id: newSetId,
        gear_id: link.gear_id,
        role: link.role,
      });
    });
  state.selectedSetId = newSetId;
  state.currentSetOrigin = "manual";
  persist();
  render();
  showToast("セットを複製しました");
}

function deleteSet(setId) {
  const set = getSetById(setId);
  if (!set) return;
  if (!window.confirm("このセットを削除しますか？")) return;

  state.db.sets = state.db.sets.filter((item) => item.id !== setId);
  state.db.setGear = state.db.setGear.filter((link) => link.set_id !== setId);
  state.db.catches = state.db.catches.filter((item) => item.set_id !== setId);
  if (state.selectedSetId === setId) {
    state.selectedSetId = state.db.sets[0]?.id || null;
    state.currentSetOrigin = "manual";
  }
  if (state.viewingSetId === setId) state.viewingSetId = null;
  state.route = state.db.sets.length ? "setup" : "home";
  state.onboarding = state.db.sets.length === 0;
  persist();
  render();
  showToast("セットを削除しました");
}

async function removeSetPhoto(setId) {
  const set = getSetById(setId);
  if (!set?.photo_path) return;
  try {
    set.photo_path = "";
    set.updated_at = nowIso();
    persist();
    render();
    showToast("写真を削除しました");
  } catch {
    showToast("保存に失敗しました");
  }
}

async function removeGearPhoto(gearId) {
  const gear = getGearById(gearId);
  if (!gear?.photo_path) return;
  try {
    gear.photo_path = "";
    persist();
    render();
    showToast("写真を削除しました");
  } catch {
    showToast("保存に失敗しました");
  }
}
