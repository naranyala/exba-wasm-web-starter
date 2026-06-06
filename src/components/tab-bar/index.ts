// src/components/tab-bar/index.ts
export class TabBar extends HTMLElement {
  private tabs: { id: string; label: string }[] = [];
  private activeTabId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() { return ['tabs']; }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'tabs') {
      this.tabs = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background-color: #09090b; /* zinc-950 */
          border-bottom: 1px solid #27272a; /* zinc-800 */
          overflow-x: auto;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 50;
          box-sizing: border-box;
        }
        .tab {
          padding: 0.3rem 0.8rem;
          font-size: 0.875rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          color: #a1a1aa; /* zinc-400 */
          background-color: #27272a; /* zinc-800 */
          white-space: nowrap;
        }
        .tab.active {
          background-color: #4f46e5; /* indigo-600 */
          color: white;
        }
        .tab:hover {
          background-color: #3f3f46; /* zinc-700 */
        }
      </style>
      ${this.tabs.map(tab => `
        <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-id="${tab.id}">
          ${tab.label}
        </div>
      `).join('')}
    `;
    this.shadowRoot.querySelectorAll('.tab').forEach(el => {
      el.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('tab-selected', { detail: (el as HTMLElement).dataset.id }));
      });
    });
  }

  setActive(id: string) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
