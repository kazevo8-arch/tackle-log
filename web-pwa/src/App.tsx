import { useEffect, useState } from "react";
import { db } from "./db";
import { seedMockData } from "./mockData";
import type { AppRoute } from "./routes";
import { routes } from "./routes";
import type { AppState, Item, ItemCategory, ItemKind, Media, Place, Result, Session, Setup } from "./models";
import { HomeView } from "./views/HomeView";
import { ItemsView } from "./views/ItemsView";
import { ItemEditView } from "./views/ItemEditView";
import { SetupsView } from "./views/SetupsView";
import { SetSelectView } from "./views/SetSelectView";
import { SetupEditView } from "./views/SetupEditView";
import { PlacesView } from "./views/PlacesView";
import { PlaceEditView } from "./views/PlaceEditView";
import { ResultAddView } from "./views/ResultAddView";
import { ResultsView } from "./views/ResultsView";
import { RiversView } from "./views/RiversView";
import { StatsView } from "./views/StatsView";
import { nowIso, uid } from "./domain";

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
        <p>この画面は後続フェーズで実装します。MVPでは主要導線から外れるため、現在は仮表示です。</p>
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
    <nav className="bottom-nav" aria-label="主要画面">
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
  const [draftItemKind, setDraftItemKind] = useState<ItemKind | undefined>();
  const [selectedRiverName, setSelectedRiverName] = useState<string | undefined>();
  const [preferredRiverName, setPreferredRiverName] = useState<string | undefined>();
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
          setupId: setup?.id ?? snapshot.appState.currentSetupId,
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

  function openSetupEditor(setupId?: string) {
    setEditingSetupId(setupId);
    setRoute("setup-edit");
  }

  function openPlaceEditor(placeId?: string, riverName?: string) {
    setEditingPlaceId(placeId);
    setPreferredRiverName(riverName);
    setRoute("place-edit");
  }

  async function handleSaved(routeAfterSave: AppRoute) {
    await refresh();
    setRoute(routeAfterSave);
  }

  function renderRoute() {
    switch (route) {
      case "home":
        return (
          <HomeView
            homeNotice={homeNotice}
            onRouteChange={setRoute}
            onStartSession={startSession}
            scrollToken={homeScrollToken}
            snapshot={snapshot}
          />
        );
      case "results":
        return <ResultsView snapshot={snapshot} onAddResult={() => setRoute("result-add")} />;
      case "result-add":
        return <ResultAddView snapshot={snapshot} onRouteChange={setRoute} onSaved={() => handleSaved("home")} />;
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
