import { css } from 'goober';

const backdrop = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const modal = css`
  background: #18181b;
  border: 1px solid rgba(39, 39, 42, 0.5);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 560px;
  padding: 1.5rem;
  color: #e4e4e7;
  font-family: inherit;
`;

const heading = css`
  margin: 0 0 1rem 0;
  color: #a5b4fc;
  font-size: 1.125rem;
  font-weight: 600;
`;

const layerCls = css`
  background: rgba(39, 39, 42, 0.5);
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(39, 39, 42, 0.5);
  &:last-child {
    margin-bottom: 0;
  }
`;

const nameCls = css`
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const infoCls = css`
  font-size: 0.8125rem;
  color: #71717a;
`;

const statusCls = css`
  float: right;
  font-size: 0.6875rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  background: rgba(79, 70, 229, 0.15);
  color: #a5b4fc;
`;

export class WasmModal extends HTMLElement {
  private boundHandler?: (e: Event) => void;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this.boundHandler) {
      this.shadowRoot
        ?.getElementById('backdrop')
        ?.removeEventListener('click', this.boundHandler);
      this.boundHandler = undefined;
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const irLayers = [
      { name: 'HLIR', status: 'Active', info: 'High-level IR Analysis' },
      {
        name: 'LLIR',
        status: 'Dispatched',
        info: 'Low-level IR Instruction set',
      },
    ];

    this.shadowRoot.innerHTML = `
      <div class="${backdrop}" id="backdrop">
        <div class="${modal}">
          <h2 class="${heading}">EXBA DevTools — IR Layers</h2>
          ${irLayers
            .map(
              (l) => `
            <div class="${layerCls}">
              <span class="${statusCls}">${l.status}</span>
              <div class="${nameCls}">${l.name}</div>
              <div class="${infoCls}">${l.info}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    this.boundHandler = (e: Event) => {
      if (e.target === e.currentTarget) this.remove();
    };
    this.shadowRoot
      .getElementById('backdrop')
      ?.addEventListener('click', this.boundHandler);
  }
}

customElements.define('wasm-modal', WasmModal);
