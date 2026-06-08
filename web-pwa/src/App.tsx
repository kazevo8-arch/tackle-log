import { useEffect, useState } from "react";
import { db } from "./db";
import { seedMockData } from "./mockData";
import type { AppRoute } from "./routes";
import { routes } from "./routes";
import type { AppState, Item, ItemCategory, Place, Result, Session, Setup } from "./models";
import { HomeView } from "./views/HomeView";
import { ItemsView } from "./views/ItemsView";
import { ItemEditView } from "./views/ItemEditView";
import { SetupsView } from "./views/SetupsView";
import { SetSelectView } from "./views/SetSelectView";
import { SetupEditView } from "./views/SetupEditView";

export type AppSnapshot = {
  appState?: AppState;
  itemCategories: ItemCategory[];
  items: Item[];
  places: Place[];
  results: Result[];
  sessions: Session[];
  setups: Setup[];
};

const emptySnapshot: AppSnapshot = {
  itemCategories: [],
  items: [],
  places: [],
  results: [],
  sessions: [],
  setups: [],
};

async function loadSnapshot(): Promise<AppSnapshot> {
  const [appState, itemCategories, items, places, results, sessions, setups] = await Promise.all([
    db.appState.get("main"),
    db.itemCategories.toArray(),
    db.items.toArray(),
    db.places.toArray(),
    db.results.toArray(),
    db.sessions.toArray(),
    db.setups.toArray(),
  ]);

  return { appState, itemCategories, items, places, results, sessions, setups };
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
    { id: "result-add", label: "釣果" },
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
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const nextSnapshot = await loadSnapshot();
    setSnapshot(nextSnapshot);
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

  async function useSetup(setupId: string) {
    const setup = snapshot.setups.find((item) => item.id === setupId);
    const primaryItemId = setup?.defaultPrimaryItemId ?? setup?.items.find((item) => item.role === "primary")?.itemId;
    await db.appState.update("main", {
      currentSetupId: setupId,
      currentPrimaryItemId: primaryItemId,
      updatedAt: new Date().toISOString(),
    });
    await refresh();
    setRoute("home");
  }

  async function usePrimaryItem(setupId: string, itemId: string) {
    await db.appState.update("main", {
      currentSetupId: setupId,
      currentPrimaryItemId: itemId,
      updatedAt: new Date().toISOString(),
    });
    await refresh();
    setRoute("home");
  }

  function openItemEditor(itemId?: string) {
    setEditingItemId(itemId);
    setRoute("item-edit");
  }

  function openSetupEditor(setupId?: string) {
    setEditingSetupId(setupId);
    setRoute("setup-edit");
  }

  async function handleSaved(routeAfterSave: AppRoute) {
    await refresh();
    setRoute(routeAfterSave);
  }

  function renderRoute() {
    switch (route) {
      case "home":
        return <HomeView snapshot={snapshot} onRouteChange={setRoute} />;
      case "items":
        return <ItemsView snapshot={snapshot} onEditItem={openItemEditor} />;
      case "item-edit":
        return (
          <ItemEditView
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
