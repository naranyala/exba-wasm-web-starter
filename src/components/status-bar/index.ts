import { css } from 'goober';

const host = css`
  & {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2rem;
    background: #09090b;
    border-top: 1px solid rgba(39, 39, 42, 0.5);
    align-items: center;
    padding: 0 1rem;
    font-size: 0.6875rem;
    font-family: inherit;
    color: #71717a;
    z-index: 100;
    gap: 1.5rem;
  }
`;

const stat = css`
  cursor: pointer;
  transition: color 0.15s ease;
  &:hover {
    color: #d4d4d8;
  }
`;

export class StatusBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['primitives', 'wasm-functions'];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const primitives = this.getAttribute('primitives') || '0';
    const wasmFuncs = this.getAttribute('wasm-functions') || '0';

    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <div class="${host}">
        <div class="${stat}" id="status-click">Primitives: <span>${primitives}</span></div>
        <div class="${stat}" id="status-click">WASM Functions: <span>${wasmFuncs}</span></div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('#status-click').forEach((el) => {
      el.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('show-modal', { bubbles: true, composed: true }),
        );
      });
    });
  }
}

customElements.define('status-bar', StatusBar);
