import { useEffect, useState } from "react";
import { db } from "./db";
import { nowIso, uid } from "./domain";
import type { AppState, Item, ItemCategory, ItemKind, Media, Place, Result, Session, Setup } from "./models";
import { routes, type AppRoute } from "./routes";
import { seedMockData } from "./mockData";
import { HomeView } from "./views/HomeView";
import { ItemEditView } from "./views/ItemEditView";
import { ItemsView } from "./views/ItemsView";
import { PlaceEditView } from "./views/PlaceEditView";
import { PlacesView } from "./views/PlacesView";
import { ResultAddView } from "./views/ResultAddView";
import { ResultEditView } from "./views/ResultEditView";
import { ResultsView } from "./views/ResultsView";
import { RiversView } from "./views/RiversView";
import { SetSelectView } from "./views/SetSelectView";
import { SetupEditView } from "./views/SetupEditView";
import { SetupsView } from "./views/SetupsView";
import { StatsView } from "./views/StatsView";

export type AppSnapshot = {
  appState?: AppState;
  itemCategories: ItemCategory[];
  items: Item[];
  media: Media[];
  places: Place[];
  results: Result[];
  sessions: Session[];
  setups: Setup[];
};

const emptySnapshot: AppSnapshot = {
  appState: undefined,
  itemCategories: [],
  items: [],
  media: [],
  places: [],
  results: [],
  sessions: [],
  setups: [],
};

async function loadSnapshot(): Promise<AppSnapshot> {
  const [appState, itemCategories, items, media, places, results, sessions, setups] = await Promise.all([
    db.appState.get("main"),
    db.itemCategories.toArray(),
    db.items.toArray(),
    db.media.toArray(),
    db.places.toArray(),
    db.results.toArray(),
    db.sessions.toArray(),
    db.setups.toArray(),
  ]);
  return { appState, itemCategories, items, media, places, results, sessions, setups };
}

function PlaceholderView({ route }: { route: AppRoute }) {
  const label = routes.find((item) => item.id === route)?.label ?? route;
  return (
    <main className="screen-content">
      <section className="panel">
        <p className="eyebrow">Phase placeholder</p>
        <h1>{label}</h1>
        <p>この画面はまだ仮実装です。MVPでは主導線に必要な画面から順に固めています。</p>
      </section>
    </main>
  );
}

function BottomNav({ route, onRouteChange }: { route: AppRoute; onRouteChange: (route: AppRoute) => void }) {
  const navItems: { id: AppRoute; label: string }[] = [
    { id: "home", label: "ホーム" },
    { id: "set-select", label: "セット" },
    { id: "results", label: "釣果" },
    { id: "stats", label: "実績" },
  ];

  return (
    <nav className="bottom-nav" aria-label="主ナビゲーション">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={item.id === route ? "nav-button nav-button-active" : "nav-button"}
          type="button"
          onClick={() => onRouteChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>("home");
  const [snapshot, setSnapshot] = useState<AppSnapshot>(emptySnapshot);
  const [editingItemId, setEditingItemId] = useState<string | undefined>();
  const [editingSetupId, setEditingSetupId] = useState<string | undefined>();
  const [editingPlaceId, setEditingPlaceId] = useState<string | undefined>();
  const [editingResultId, setEditingResultId] = useState<string | undefined>();
  const [draftItemKind, setDraftItemKind] = useState<ItemKind | undefined>();
  const [selectedRiverName, setSelectedRiverName] = useState<string | undefined>();
  const [preferredRiverName, setPreferredRiverName] = useState<string | undefined>();
  const [setupEditFocus, setSetupEditFocus] = useState<"top" | "current-item">("top");
  const [homeNotice, setHomeNotice] = useState<string | undefined>();
  const [homeScrollToken, setHomeScrollToken] = useState(0);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setSnapshot(await loadSnapshot());
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await seedMockData();
      const nextSnapshot = await loadSnapshot();
      if (!cancelled) {
        setSnapshot(nextSnapshot);
        setLoading(false);
      }
    }
    boot().catch((error) => {
      console.error(error);
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!homeNotice) return;
    const timeoutId = window.setTimeout(() => setHomeNotice(undefined), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [homeNotice]);

  function returnHomeWithNotice(message: string) {
    setHomeNotice(message);
    setHomeScrollToken((current) => current + 1);
    setRoute("home");
  }

  async function useSetup(setupId: string) {
    const setup = snapshot.setups.find((item) => item.id === setupId);
    const primaryItemId = setup?.defaultPrimaryItemId ?? setup?.items.find((item) => item.role === "primary")?.itemId;
    const updatedAt = nowIso();
    await db.transaction("rw", [db.appState, db.sessions], async () => {
      await db.appState.update("main", {
        currentSetupId: setupId,
        currentPrimaryItemId: primaryItemId,
        updatedAt,
      });
      if (snapshot.appState?.activeSessionId) {
        await db.sessions.update(snapshot.appState.activeSessionId, {
          setupId,
          currentPrimaryItemId: primaryItemId,
          updatedAt,
        });
      }
    });
    await refresh();
    returnHomeWithNotice("更新しました");
  }

  async function usePrimaryItem(setupId: string, itemId: string) {
    const updatedAt = nowIso();
    await db.transaction("rw", [db.appState, db.sessions], async () => {
      await db.appState.update("main", {
        currentSetupId: setupId,
        currentPrimaryItemId: itemId,
        updatedAt,
      });
      if (snapshot.appState?.activeSessionId) {
        await db.sessions.update(snapshot.appState.activeSessionId, {
          setupId,
          currentPrimaryItemId: itemId,
          updatedAt,
        });
      }
    });
    await refresh();
    returnHomeWithNotice("更新しました");
  }

  async function usePlace(placeId: string) {
    const updatedAt = nowIso();
    const place = snapshot.places.find((item) => item.id === placeId);
    await db.transaction("rw", [db.appState, db.places, db.sessions], async () => {
      await db.appState.update("main", {
        currentPlaceId: placeId,
        updatedAt,
      });
      if (snapshot.appState?.activeSessionId) {
        await db.sessions.update(snapshot.appState.activeSessionId, {
          placeId,
          updatedAt,
        });
      }
      await db.places.update(placeId, {
        lastUsedAt: updatedAt,
        updatedAt,
      });
    });
    setSelectedRiverName(place?.riverName);
    await refresh();
    returnHomeWithNotice("更新しました");
  }

  async function useItemFromStats(itemId: string) {
    const currentSetup = snapshot.setups.find((setup) => setup.id === snapshot.appState?.currentSetupId);
    const setup = currentSetup?.items.some((item) => item.itemId === itemId)
      ? currentSetup
      : snapshot.setups.find((candidate) => candidate.items.some((item) => item.itemId === itemId));
    const updatedAt = nowIso();
    await db.transaction("rw", [db.appState, db.sessions], async () => {
      await db.appState.update("main", {
        currentSetupId: setup?.id ?? snapshot.appState?.currentSetupId,
        currentPrimaryItemId: itemId,
        updatedAt,
      });
      if (snapshot.appState?.activeSessionId) {
        await db.sessions.update(snapshot.appState.activeSessionId, {
          setupId: setup?.id ?? snapshot.appState?.currentSetupId,
          currentPrimaryItemId: itemId,
          updatedAt,
        });
      }
    });
    await refresh();
    returnHomeWithNotice("更新しました");
  }

  async function startSession() {
    const setupId = snapshot.appState?.currentSetupId;
    const placeId = snapshot.appState?.currentPlaceId;
    if (!setupId) {
      setRoute("set-select");
      return;
    }
    if (!placeId) {
      setRoute("rivers");
      return;
    }
    const setup = snapshot.setups.find((item) => item.id === setupId);
    const place = snapshot.places.find((item) => item.id === placeId);
    if (!setup || !place) return;

    const createdAt = nowIso();
    const sessionId = uid("session");
    await db.transaction("rw", [db.sessions, db.appState, db.places], async () => {
      await db.sessions.put({
        id: sessionId,
        title: `${place.riverName} ${place.areaName}`,
        setupId,
        placeId,
        currentPrimaryItemId: snapshot.appState?.currentPrimaryItemId,
        status: "active",
        startedAt: createdAt,
        note: "",
        createdAt,
        updatedAt: createdAt,
      });
      await db.appState.update("main", {
        activeSessionId: sessionId,
        updatedAt: createdAt,
      });
      await db.places.update(placeId, {
        lastUsedAt: createdAt,
        updatedAt: createdAt,
      });
    });
    await refresh();
    returnHomeWithNotice("更新しました");
  }

  function openItemEditor(itemId?: string, initialKind?: ItemKind) {
    setEditingItemId(itemId);
    setDraftItemKind(initialKind);
    setRoute("item-edit");
  }

  function openSetupEditor(setupId?: string, focus: "top" | "current-item" = "top") {
    setEditingSetupId(setupId);
    setSetupEditFocus(focus);
    setRoute("setup-edit");
  }

  function openPlaceEditor(placeId?: string, riverName?: string) {
    setEditingPlaceId(placeId);
    setPreferredRiverName(riverName);
    setRoute("place-edit");
  }

  function openResultEditor(resultId: string) {
    setEditingResultId(resultId);
    setRoute("result-edit");
  }

  async function handleSaved(routeAfterSave: AppRoute) {
    await refresh();
    setRoute(routeAfterSave);
  }

  async function toggleResultFavorite(resultId: string) {
    const result = snapshot.results.find((item) => item.id === resultId);
    if (!result) return;
    await db.results.update(resultId, {
      isFavorite: !result.isFavorite,
      updatedAt: nowIso(),
    });
    await refresh();
  }

  async function toggleResultMemorial(resultId: string) {
    const result = snapshot.results.find((item) => item.id === resultId);
    if (!result) return;
    await db.results.update(resultId, {
      isMemorial: !result.isMemorial,
      updatedAt: nowIso(),
    });
    await refresh();
  }

  function renderRoute() {
    switch (route) {
      case "home":
        return (
          <HomeView
            homeNotice={homeNotice}
            onEditCurrentItem={() => {
              if (snapshot.appState?.currentSetupId) {
                openSetupEditor(snapshot.appState.currentSetupId, "current-item");
                return;
              }
              setRoute("set-select");
            }}
            onRouteChange={setRoute}
            onStartSession={startSession}
            onToggleFavorite={toggleResultFavorite}
            scrollToken={homeScrollToken}
            snapshot={snapshot}
          />
        );
      case "results":
        return (
          <ResultsView
            snapshot={snapshot}
            onAddResult={() => setRoute("result-add")}
            onEditResult={openResultEditor}
            onToggleFavorite={toggleResultFavorite}
            onToggleMemorial={toggleResultMemorial}
          />
        );
      case "result-add":
        return <ResultAddView snapshot={snapshot} onRouteChange={setRoute} onSaved={() => handleSaved("home")} />;
      case "result-edit":
        return (
          <ResultEditView
            resultId={editingResultId}
            snapshot={snapshot}
            onBack={() => setRoute("results")}
            onSaved={() => handleSaved("results")}
          />
        );
      case "items":
        return <ItemsView snapshot={snapshot} onEditItem={openItemEditor} />;
      case "item-edit":
        return (
          <ItemEditView
            initialKind={draftItemKind}
            itemId={editingItemId}
            snapshot={snapshot}
            onBack={() => setRoute("items")}
            onSaved={() => handleSaved("items")}
          />
        );
      case "setups":
        return <SetupsView snapshot={snapshot} onEditSetup={openSetupEditor} onUseSetup={useSetup} />;
      case "set-select":
        return (
          <SetSelectView
            snapshot={snapshot}
            onEditSetup={openSetupEditor}
            onRouteChange={setRoute}
            onUsePrimaryItem={usePrimaryItem}
            onUseSetup={useSetup}
          />
        );
      case "setup-edit":
        return (
          <SetupEditView
            focusSection={setupEditFocus}
            setupId={editingSetupId}
            snapshot={snapshot}
            onBack={() => setRoute("setups")}
            onSaved={() => handleSaved("setups")}
          />
        );
      case "rivers":
        return (
          <RiversView
            snapshot={snapshot}
            onAddPlace={() => openPlaceEditor(undefined)}
            onSelectRiver={(riverName) => {
              setSelectedRiverName(riverName);
              setRoute("places");
            }}
          />
        );
      case "places":
        return (
          <PlacesView
            selectedRiverName={selectedRiverName}
            snapshot={snapshot}
            onEditPlace={(placeId) => openPlaceEditor(placeId, selectedRiverName)}
            onRouteChange={setRoute}
            onUsePlace={usePlace}
          />
        );
      case "place-edit":
        return (
          <PlaceEditView
            placeId={editingPlaceId}
            preferredRiverName={preferredRiverName}
            snapshot={snapshot}
            onBack={() => setRoute("places")}
            onSaved={() => handleSaved("places")}
          />
        );
      case "stats":
        return <StatsView snapshot={snapshot} onUseItem={useItemFromStats} onUsePlace={usePlace} onUseSetup={useSetup} />;
      default:
        return <PlaceholderView route={route} />;
    }
  }

  return (
    <div className="app-shell">
      {loading ? (
        <main className="screen-content">
          <section className="panel">
            <h1>Fishing Log</h1>
            <p>ローカルデータを読み込んでいます。</p>
          </section>
        </main>
      ) : (
        renderRoute()
      )}
      <BottomNav route={route} onRouteChange={setRoute} />
    </div>
  );
}
