import './style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './components/tab-bar.js';
import './components/accordion-demo.js';
import './components/treeview-demo.js';
import './components/datatable-demo.js';
import './components/cube-demo.js';
import './components/wizard-demo.js';
import './components/drawer-demo.js';
import { demoRegistry, rebuildDemoAction } from './demos/index.js';
import { showBaexDevTools } from './devtools.js';
import { WasmBridge } from './framework/WasmBridge.js';
import * as styles from './styles.js';
import {
  renderTabBar,
  restoreTabState,
  saveTabState,
  state,
  tabs,
} from './tab-state.js';
import * as tableOps from './table-operations.js';
import { registerTableView } from './table-view.js';

/**
 * Performs a fuzzy search over a list of items based on their label.
 * The search matches if all characters of the query appear in the label in order.
 *
 * @param query - The search string.
 * @param items - A list of items containing a 'label' property.
 * @returns A filtered list of items that match the fuzzy search criteria.
 */
export function fuzzySearch(query: string, items: any[]) {
  const q = query
    .toLowerCase()
    .split('')
    .filter((c) => c !== ' ');
  return items.filter((item) => {
    const label = item.label.toLowerCase();
    let i = 0;
    for (const char of q) {
      i = label.indexOf(char, i);
      if (i === -1) return false;
      i++;
    }
    return true;
  });
}

function rebuildTabAction(id: string, label: string): (() => void) | null {
  if (id === 'leaflet-map') {
    return () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML =
        '<div id="map" style="height: 500px; border-radius: var(--radius-lg); overflow: hidden;"></div>';
      const map = L.map('map').setView([51.505, -0.09], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    };
  }
  const demo = demoRegistry.find((d) => d.id === id);
  if (demo) return demo.action;
  if (id.startsWith('table-')) {
    const tableName = id.slice(6);
    return () => tableOps.renderTableContent(tableName);
  }
  if (id.startsWith('rag-')) {
    return () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--zinc-400);"><h2>${label}</h2><p>The ${label} module is coming soon. This will be a dedicated RAG component.</p></div>`;
    };
  }
  return null;
}

/**
 * Initializes the application shell, sets up the main UI layout,
 * and restores previous session state from storage.
 *
 * This is the main entry point for the application's runtime setup.
 */
export async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  registerTableView();

  const primitiveCount = Object.values(WasmBridge).reduce(
    (acc, cat) => acc + Object.keys(cat).length,
    0,
  );
  const regularCount = 3;
  const dirName = (window as any).__DIRNAME__ || 'BAEX';
  document.title = dirName;

  app.innerHTML = `
    <div class="${styles.navBar}">
      <button class="${styles.homeButton}" id="home-btn">
        <span style="font-size: 1.125rem;">&#9670;</span> BAEX
      </button>
      <tab-bar id="main-tab-bar" style="flex: 1; min-width: 0;"></tab-bar>
    </div>
    <div class="${styles.appContainer}">
      <div class="${styles.contentWrapper}">
        <div id="home-view">
          <div class="${styles.homeHeader}">
            <h1>Database Explorer</h1>
            <p>Browse and manage your SQLite tables</p>
          </div>
          <div class="${styles.searchWrapper}">
            <input type="text" id="menu-search" class="${styles.searchInput}" placeholder="Search tables..." />
          </div>
          <div class="${styles.sectionContainer}"><div id="menu-grid" class="${styles.menuGrid}"></div></div>
          <div class="${styles.sectionHeading}">Components</div>
          <div class="${styles.sectionContainer}"><div id="demo-grid" class="${styles.menuGrid}"></div></div>
          <div class="${styles.sectionHeading}">RAG System</div>
          <div class="${styles.sectionContainer}"><div id="rag-grid" class="${styles.menuGrid}"></div></div>
        </div>
        <div id="dynamic-view" style="display: none;"></div>
      </div>
    </div>
    <div class="${styles.statusBar}" id="status-bar" style="display: flex; justify-content: space-between; align-items: center;">
      <span style="display: flex; align-items: center; gap: 0.5rem;">${dirName}</span>
      <span style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
        WASM: ${primitiveCount} primitives <span style="opacity: 0.3;">|</span> JS: ${regularCount} fns
      </span>
    </div>
  `;

  document
    .getElementById('status-bar')
    ?.addEventListener('click', showBaexDevTools);

  document.getElementById('home-btn')?.addEventListener('click', () => {
    state.activeTabId = null;
    (document.getElementById('home-view') as HTMLElement).style.display =
      'block';
    (document.getElementById('dynamic-view') as HTMLElement).style.display =
      'none';
    renderTabBar();
  });

  const tabBar = document.getElementById('main-tab-bar');
  tabBar?.addEventListener('tab-selected', (e: any) => {
    state.activeTabId = e.detail;
    const homeView = document.getElementById('home-view') as HTMLElement;
    const dynamicView = document.getElementById('dynamic-view') as HTMLElement;
    if (homeView) homeView.style.display = 'none';
    if (dynamicView) dynamicView.style.display = 'block';
    const tab = tabs.get(state.activeTabId!);
    if (tab) tab.action();
    renderTabBar();
  });

  tabBar?.addEventListener('tab-close', (e: any) => {
    const id = e.detail;
    tabs.delete(id);
    if (tabs.size === 0) {
      state.activeTabId = null;
      (document.getElementById('home-view') as HTMLElement).style.display =
        'block';
      (document.getElementById('dynamic-view') as HTMLElement).style.display =
        'none';
    } else if (state.activeTabId === id) {
      const firstTab = Array.from(tabs.keys())[0];
      state.activeTabId = firstTab;
      const tab = tabs.get(firstTab);
      if (tab) {
        (document.getElementById('home-view') as HTMLElement).style.display =
          'none';
        (document.getElementById('dynamic-view') as HTMLElement).style.display =
          'block';
        tab.action();
      }
    }
    renderTabBar();
  });

  const menuGridEl = document.getElementById('menu-grid');
  try {
    const tables = await tableOps.fetchTables();
    if (tables.length === 0) {
      menuGridEl!.innerHTML =
        '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--zinc-400);">No tables found. Run some SQL to create them!</div>';
    } else {
      tables.forEach((tableName: string) => {
        const el = document.createElement('div');
        el.className = styles.menuItem;
        el.innerHTML = '<div>📦</div><div>' + tableName + '</div>';
        el.onclick = () => {
          const tabId = `table-${tableName}`;
          tabs.set(tabId, {
            label: tableName,
            action: () => tableOps.renderTableContent(tableName),
          });
          state.activeTabId = tabId;
          (document.getElementById('home-view') as HTMLElement).style.display =
            'none';
          tableOps.renderTableContent(tableName);
          renderTabBar();
        };
        menuGridEl?.appendChild(el);
      });
    }
  } catch (error: any) {
    menuGridEl!.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--red-500); background: rgba(239, 68, 68, 0.1); border: 1px solid var(--red-500); border-radius: var(--radius-lg);"><strong>Database Error:</strong><br/>${error.message || error}</div>`;
  }

  const demoGridEl = document.getElementById('demo-grid');
  const addDemoItem = (
    icon: string,
    label: string,
    tabId: string,
    action: () => void,
  ) => {
    const el = document.createElement('div');
    el.className = styles.menuItem;
    el.innerHTML = '<div>' + icon + '</div><div>' + label + '</div>';
    el.onclick = () => {
      tabs.set(tabId, { label, action });
      state.activeTabId = tabId;
      (document.getElementById('home-view') as HTMLElement).style.display =
        'none';
      action();
      renderTabBar();
    };
    demoGridEl?.appendChild(el);
  };

  demoRegistry.forEach((demo) =>
    addDemoItem(demo.icon, demo.label, demo.id, demo.action),
  );

  const ragGridEl = document.getElementById('rag-grid');
  const addRagItem = (
    icon: string,
    label: string,
    tabId: string,
    action: () => void,
  ) => {
    const el = document.createElement('div');
    el.className = styles.menuItem;
    el.innerHTML = '<div>' + icon + '</div><div>' + label + '</div>';
    el.onclick = () => {
      tabs.set(tabId, { label, action });
      state.activeTabId = tabId;
      (document.getElementById('home-view') as HTMLElement).style.display =
        'none';
      action();
      renderTabBar();
    };
    ragGridEl?.appendChild(el);
  };

  const ragItems = [
    { icon: '📚', label: 'Knowledge Base', id: 'rag-kb' },
    { icon: '📦', label: 'Vector DB', id: 'rag-vector' },
    { icon: '✂️', label: 'Chunking', id: 'rag-chunk' },
    { icon: '🧠', label: 'Embeddings', id: 'rag-embed' },
    { icon: '✍️', label: 'Prompt Tuning', id: 'rag-prompt' },
    { icon: '🔍', label: 'Retrieval Tuning', id: 'rag-retrieve' },
    { icon: '💬', label: 'RAG Chat', id: 'rag-chat' },
    { icon: '📊', label: 'Eval & Benchmarks', id: 'rag-eval' },
  ];

  ragItems.forEach((item) => {
    addRagItem(item.icon, item.label, item.id, () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--zinc-400);"><h2>${item.label}</h2><p>The ${item.label} module is coming soon. This will be a dedicated RAG component.</p></div>`;
    });
  });

  const saved = restoreTabState();
  if (saved) {
    for (const { id, label } of saved.tabs) {
      const action = rebuildTabAction(id, label);
      if (action) tabs.set(id, { label, action });
    }
    state.activeTabId =
      saved.activeTabId && tabs.has(saved.activeTabId)
        ? saved.activeTabId
        : null;
  }

  if (state.activeTabId) {
    const tab = tabs.get(state.activeTabId);
    if (tab) {
      (document.getElementById('home-view') as HTMLElement).style.display =
        'none';
      (document.getElementById('dynamic-view') as HTMLElement).style.display =
        'block';
      tab.action();
    }
  }
  renderTabBar();
}

/**
 * Bootstraps the application by waiting for the DOM to be fully loaded.
 */
export function startApp() {
  document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
  });
}
