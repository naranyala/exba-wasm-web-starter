import { ExbaComponent } from '@core/lifecycle/component';
import { MENU_CATEGORIES, MENU_ITEMS } from '@shell/constants';
import { styles } from '@shell/theme/styles';
import { html } from '@core/dom/dom';

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

  protected state = this.useSignal({
    query: '',
    collapsedCategories: {
      'component-examples': true,
      'browser-api': true,
    } as Record<string, boolean>
  });

  render() {
    const { query, collapsedCategories } = this.state.value;
    const filteredItems = query
      ? MENU_ITEMS.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase()),
        )
      : MENU_ITEMS;

    const itemsSet = new Set(filteredItems.map((i) => i.id));

    return html`
      <div class="${styles.menuContainer}">
        <div class="${styles.sidebarSearch}">
          <input 
              type="text" 
              class="${styles.searchInput}" 
              placeholder="Search menu..." 
              .value="${query}"
              @input="${(e: any) => this.handleSearch(e.target.value)}"
          />
        </div>
        <div id="menu-grid" style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: 1rem;">
          ${MENU_CATEGORIES.map((category) => {
            const categoryItems = category.items.filter((item) =>
              itemsSet.has(item.id),
            );
            if (categoryItems.length === 0) return '';

            const isCollapsed = query === '' && collapsedCategories[category.id];

            return html`
              <div class="${styles.sectionCard}">
                <div class="${styles.sectionHeader}" @click="${() => this.toggleCategory(category.id)}">
                  <h3 class="${styles.sectionTitle}">${category.label}</h3>
                  <div class="${styles.sectionArrow} ${isCollapsed ? '' : styles.rotate180}">▼</div>
                </div>
                <div class="${styles.sectionBody}" style="${isCollapsed ? 'display: none;' : ''}">
                  <div class="${styles.menuGrid}" style="margin: 0; max-width: none;">
                    ${categoryItems.map(
                      (item) => html`
                      <div class="${styles.menuItem}" @click="${() => (window as any).dispatchMenuAction(item.id)}">
                        <div class="${styles.menuItemIcon}">${item.icon}</div>
                        <div class="${styles.menuItemLabel}">${item.label}</div>
                      </div>
                    `
                    )}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private handleSearch(query: string) {
    this.setState({ query });
  }

  private toggleCategory(id: string) {
    const collapsed = { ...this.state.value.collapsedCategories };
    collapsed[id] = !collapsed[id];
    this.setState({ collapsedCategories: collapsed });
  }
}

