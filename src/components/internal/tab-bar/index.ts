import { EXBA } from '@core/lifecycle/exba';
import { ExbaComponent } from '@core/lifecycle/component';
import { html } from '@core/dom/dom';
import { ease, t } from '@shell/theme/styles';

/**
 * A multi-tab navigation component used in the application shell.
 *
 * Manages a list of dynamic tabs and a persistent 'Home' button.
 * Communicates with the shell via custom events:
 * - `tab-selected`: Dispatched when a tab or the home button is clicked.
 * - `tab-closed`: Dispatched when the close button on a tab is clicked.
 *
 * @extends ExbaComponent
 */
export class TabBar extends ExbaComponent {
  static props = {
    tabs: 'json',
    activeTabId: 'string'
  };

  static styles = {
    host: `
      display: flex;
      gap: 0.25rem;
      padding: 0 0.5rem;
      background: ${t.zinc950};
      border-bottom: 1px solid ${t.zinc800a};
      overflow-x: auto;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3rem;
      z-index: 50;
      box-sizing: border-box;
      align-items: center;
    `,
    tab: `
      display: flex;
      align-items: center;
      padding: 0 0.5rem 0 0.75rem;
      font-size: 0.8125rem;
      font-family: inherit;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background ${ease}, color ${ease};
      color: ${t.zinc400};
      background: transparent;
      white-space: nowrap;
      user-select: none;
      height: 2rem;
      margin: 0.5rem 0;
      gap: 0.5rem;
      &:hover:not(.active) {
        background: ${t.zinc800a};
        color: ${t.zinc200};
      }
      &.active {
        background: ${t.indigo600a};
        color: ${t.indigo300};
      }
    `,
    'close-btn': `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      color: ${t.zinc500};
      transition: all ${ease};
      &:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }
    `,
    'home-button': `
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      font-size: 0.8125rem;
      font-family: inherit;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background ${ease};
      color: ${t.white};
      background: ${t.indigo600};
      margin-right: 0.5rem;
      white-space: nowrap;
      user-select: none;
      height: 2rem;
      margin: 0.5rem 0;
      &:hover {
        background: ${t.indigo500};
      }
    `
  };

  constructor() {
    super();
  }

  /**
   * Renders the tab bar structure and attaches event listeners.
   */
  render() {
    const tabsList = (this as any).tabs || [];
    const activeId = (this as any).activeTabId;

    return html`
      <div class="host">
        <div class="home-button" @click="${() => this.selectTab('home')}">🏠 Home</div>
        ${tabsList.map(
          (t: any) => html`
          <div class="tab ${t.id === activeId ? 'active' : ''}" @click="${() => this.selectTab(t.id)}">
            <span>${t.label}</span>
            <div class="close-btn" @click="${(e: Event) => this.closeTab(e, t.id)}">✕</div>
          </div>
        `
        )}
      </div>
    `;
  }

  private selectTab(id: string) {
    this.dispatchEvent(
      new CustomEvent('tab-selected', {
        detail: id,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private closeTab(e: Event, id: string) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('tab-closed', {
        detail: id,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Manually sets the active tab by ID.
   * @param id The ID of the tab to activate, or null for none.
   */
  setActive(id: string | null) {
    this.setState({ activeTabId: id || undefined });
  }
}

