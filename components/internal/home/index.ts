import { MENU_CATEGORIES, MENU_ITEMS } from '@shell/constants';
import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';

/**
 * The main dashboard component for the EXBA application shell.
 * 
 * Renders a searchable, categorized grid of menu items defined in 
 * `MENU_CATEGORIES`. It allows users to explore demos and examples.
 * 
 * @extends ExbaComponent
 */
export class HomeComponent extends ExbaComponent {
  static useShadow = false;
  static props = {};
  static styles = {};

  // Track collapsed state per category ID
  private collapsedCategories: Record<string, boolean> = {
    'component-examples': true,
    'browser-api': true,
  };

  render() {
    return `
      <div class="${styles.menuContainer}">
        <div class="${styles.sidebarSearch}">
          <input 
              type="text" 
              id="menu-search" 
              class="${styles.searchInput}" 
              placeholder="Search menu..." 
          />
        </div>
        <div id="menu-grid" style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: 1rem;"></div>
      </div>
    `;
  }

  /**
   * Standard Web Component callback.
   * Initializes the grid menu and attaches the search listener.
   */
  connectedCallback() {
    super.connectedCallback();
    this.renderGridMenu();

    const searchEl = document.querySelector<HTMLInputElement>('#menu-search');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value;
        const filtered = MENU_ITEMS.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase()),
        );
        this.updateGrid(filtered, query.trim() !== '');
      });
    }

    // Bind global toggle method
    (window as any).toggleCategory = (id: string) => {
      this.collapsedCategories[id] = !this.collapsedCategories[id];
      // Re-render with current search filter if any
      const searchEl = document.querySelector<HTMLInputElement>('#menu-search');
      const query = searchEl?.value || '';
      
      const filtered = query ? MENU_ITEMS.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase()),
      ) : MENU_ITEMS;

      this.updateGrid(filtered, query.trim() !== '');
    };
  }

  /**
   * Initial rendering of the grid with all available menu items.
   */
  private renderGridMenu() {
    this.updateGrid(MENU_ITEMS, false);
  }

  /**
   * Updates the DOM of the menu grid with a specific list of items.
   * Groups items by their original categories.
   * @param items The list of menu items to display.
   * @param forceOpen If true (e.g. during search), force all categories open
   */
  private updateGrid(items: typeof MENU_ITEMS, forceOpen: boolean = false) {
    const grid = document.querySelector<HTMLDivElement>('#menu-grid');
    if (!grid) return;

    const itemsSet = new Set(items.map((i) => i.id));

    grid.innerHTML = MENU_CATEGORIES.map((category) => {
      const categoryItems = category.items.filter((item) =>
        itemsSet.has(item.id),
      );
      if (categoryItems.length === 0) return '';

      const isCollapsed = !forceOpen && this.collapsedCategories[category.id];

      return `
        <div class="${styles.sectionCard}">
          <div class="${styles.sectionHeader}" onclick="window.toggleCategory('${category.id}')">
            <h3 class="${styles.sectionTitle}">${category.label}</h3>
            <div class="${styles.sectionArrow} ${isCollapsed ? '' : styles.rotate180}">▼</div>
          </div>
          <div class="${styles.sectionBody}" style="${isCollapsed ? 'display: none;' : ''}">
            <div class="${styles.menuGrid}" style="margin: 0; max-width: none;">
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
          </div>
        </div>
      `;
    }).join('');
  }
}

