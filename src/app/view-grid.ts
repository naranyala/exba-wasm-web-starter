import {
  executionLog,
  layoutShell,
  mainContent,
  mainScroll,
  menuGrid,
  menuItem,
  menuItemIcon,
  menuItemLabel,
  searchInput,
  sidebar,
  sidebarHeader,
  sidebarSearch,
  viewHeading,
} from '../styles';
import { MENU_ITEMS } from './constants';
import { fuzzySearch } from './utils';

export function renderTabBar(
  tabs: Map<string, any>,
  activeTabId: string | null,
) {
  const tabBar = document.querySelector('tab-bar') as any;
  if (tabBar) {
    tabBar.setAttribute(
      'tabs',
      JSON.stringify(
        Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label })),
      ),
    );
    if (activeTabId) tabBar.setActive(activeTabId);
  }
}

export function renderGridMenu(items: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (item) => `
    <div class="${menuItem}" onclick="window.dispatchMenuAction('${item.id}')">
      <div class="${menuItemIcon}">${item.icon}</div>
      <div class="${menuItemLabel}">${item.label}</div>
    </div>
  `,
    )
    .join('');
}

export function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    console.error('Element #app not found');
    return;
  }

  app.innerHTML = `
    <div class="${layoutShell}">
      <aside class="${sidebar}">
        <div class="${sidebarHeader}">EXBA Menu</div>
        <div class="${sidebarSearch}">
          <input 
              type="text" 
              id="menu-search" 
              class="${searchInput}" 
              placeholder="Search..." 
          />
        </div>
        <div id="menu-grid" class="${menuGrid}"></div>
      </aside>

      <main class="${mainContent}">
        <div class="${mainScroll}">
            <div id="view-container">
                <h1 class="${viewHeading}">Select an item</h1>
            </div>
            <div id="execution-log" class="${executionLog}"></div>
        </div>
      </main>
    </div>
  `;

  const searchEl = document.querySelector<HTMLInputElement>('#menu-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      const filtered = fuzzySearch(query, MENU_ITEMS);
      renderGridMenu(filtered);
    });
  }

  renderGridMenu(MENU_ITEMS);
}
