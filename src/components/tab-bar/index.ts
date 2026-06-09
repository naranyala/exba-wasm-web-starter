import { css } from 'goober';

const host = css`
  & {
    display: flex;
    gap: 0.25rem;
    padding: 0 0.5rem;
    background: #09090b;
    border-bottom: 1px solid rgba(39, 39, 42, 0.5);
    overflow-x: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    z-index: 50;
    box-sizing: border-box;
    align-items: stretch;
  }
`;

const tab = css`
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  font-family: inherit;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  color: #a1a1aa;
  background: transparent;
  white-space: nowrap;
  user-select: none;
  &:hover:not(.active) {
    background: rgba(39, 39, 42, 0.5);
    color: #d4d4d8;
  }
  &.active {
    background: rgba(79, 70, 229, 0.2);
    color: #a5b4fc;
  }
`;

export class TabBar extends HTMLElement {
  private tabs: { id: string; label: string }[] = [];
  private activeTabId: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['tabs'];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'tabs') {
      this.tabs = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <div class="${host}">
        ${this.tabs
          .map(
            (t) => `
          <div class="${tab} ${t.id === this.activeTabId ? 'active' : ''}" data-id="${t.id}">
            ${t.label}
          </div>
        `,
          )
          .join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('tab-selected', {
            detail: (el as HTMLElement).dataset.id,
          }),
        );
      });
    });
  }

  setActive(id: string) {
    this.activeTabId = id;
    this.render();
  }
}

customElements.define('tab-bar', TabBar);
