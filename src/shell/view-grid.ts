import { MENU_CATEGORIES, type MENU_ITEMS } from '@shell/constants';
import { styles } from '@shell/theme/styles';
import '@shell/theme/theme-provider';

/**
 * Renders the top navigation tab bar with a list of active tabs.
 * @param tabs A map of tab IDs to their display labels and associated actions.
 * @param activeTabId The ID of the currently selected tab, or null if no tab is active.
 * @returns void
 */
export function renderTabBar(
  tabs: Map<string, { label: string; action: () => void }>,
  activeTabId: string | null,
) {
  const tabBar = document.querySelector('tab-bar') as HTMLElement & {
    setActive: (id: string | null) => void;
  };
  if (tabBar) {
    tabBar.setAttribute(
      'tabs',
      JSON.stringify(
        Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label })),
      ),
    );
    if (activeTabId) {
      tabBar.setActive(activeTabId);
    } else {
      tabBar.setActive(null);
    }
  }
}

/**
 * Renders the categorized menu grid based on a filtered list of items.
 * Each item in the grid can trigger an action in the shell.
 * @param filteredItems List of menu items to display.
 * @returns void
 */
export function renderGridMenu(filteredItems: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;

  const itemsSet = new Set(filteredItems.map((i) => i.id));

  grid.innerHTML = MENU_CATEGORIES.map((category) => {
    const categoryItems = category.items.filter((item) =>
      itemsSet.has(item.id),
    );
    if (categoryItems.length === 0) return '';

    return `
      <div class="${styles.categoryTitle}">${category.label}</div>
      <div class="${styles.menuGrid}">
        ${categoryItems
          .map(
            (item) => `
          <div class="${styles.menuItem}" onclick="window.dispatchMenuAction('${item.id}')">
            <div class="${styles.menuItemIcon}">${item.icon}</div>
            <div class="${styles.menuItemLabel}">${item.label}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  }).join('');
}

/**
 * Initializes the main application shell and mounts the core UI components.
 * Sets up the theme provider, layout shell, and main content container.
 * @returns void
 */
export function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    console.error('Element #app not found');
    return;
  }

  app.innerHTML = `
    <exba-theme-provider initialMode="system">
      <div class="${styles.appShell}">
        <status-bar primitives="12" wasm-functions="8"></status-bar>
        <tab-bar id="main-tab-bar"></tab-bar>
        <main class="${styles.mainContent}">
          <div id="view-container" class="${styles.viewContainer}"></div>
        </main>
      </div>
    </exba-theme-provider>
  `;
}
