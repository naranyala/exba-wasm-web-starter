// src/components/tab-bar.js
class TabBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tabs = [];
    this.activeTabId = null;
    this.render();
  }

  static get observedAttributes() {
    return ['tabs'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'tabs') {
      this.tabs = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
         :host {
           display: flex;
           align-items: stretch;
           overflow-x: auto;
           overflow-y: hidden;
           scrollbar-width: none;
           -webkit-overflow-scrolling: touch;
           -ms-overflow-style: none;
         }
         :host::-webkit-scrollbar { display: none; }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0 0.5rem 0 0.75rem;
          font-size: 0.8125rem;
          cursor: pointer;
          color: var(--zinc-400, #a1a1aa);
          background: transparent;
          white-space: nowrap;
          flex-shrink: 0;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          border: none;
          border-right: 1px solid var(--zinc-700, #3f3f46);
          transition: background 0.15s;
        }
        .tab.active {
          background: var(--zinc-800, #27272a);
          color: var(--zinc-100, #f4f4f5);
        }
        .tab.active .close-btn {
          color: rgba(255,255,255,0.6);
        }
        .tab.active .close-btn:hover {
          color: white;
          background: rgba(255,255,255,0.12);
        }
        .tab:hover {
          background: var(--zinc-800, #27272a);
        }
        .close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.25rem;
          border: none;
          background: transparent;
          color: var(--zinc-500, #71717a);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.1);
          color: var(--zinc-300, #d4d4d8);
        }
        @media (min-width: 640px) {
          .tab {
            padding: 0 0.625rem 0 1rem;
            font-size: 0.875rem;
          }
        }
      </style>
      ${this.tabs
        .map(
          (tab) => `
        <div class="tab ${tab.id === this.activeTabId ? 'active' : ''}" data-id="${tab.id}">
          <span>${tab.label}</span>
          <button class="close-btn" data-id="${tab.id}">&times;</button>
        </div>
      `,
        )
        .join('')}
    `;
    this.shadowRoot.querySelectorAll('.tab').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.close-btn')) return;
        this.dispatchEvent(
          new CustomEvent('tab-selected', { detail: el.dataset.id }),
        );
      });
    });
    this.shadowRoot.querySelectorAll('.close-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(
          new CustomEvent('tab-close', { detail: btn.dataset.id }),
        );
      });
    });
  }

  setActive(id) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
