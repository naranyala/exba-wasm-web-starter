import { ExbaComponent } from '@core/lifecycle/component';
import { ease, t } from '@shell/theme/styles';

/**
 * A reactive status bar displayed at the bottom of the application shell.
 *
 * Displays key framework metrics such as the number of active primitives
 * and WASM-exposed functions. It also includes a reactive global counter
 * driven by the EXBA signal system.
 *
 * @extends ExbaComponent
 */
export class StatusBar extends ExbaComponent {
  /** Observed properties for the StatusBar */
  static props = {
    /** The number of active UI primitives */
    primitives: 'number',
    /** The number of functions exposed via the WASM bridge */
    'wasm-functions': 'number',
  };

  /** Scoped styles for the StatusBar */
  static styles = {
    host: `display: flex; position: fixed; bottom: 0; left: 0; width: 100%; height: 2rem; background: ${t.zinc950}; border-top: 1px solid ${t.zinc800a}; align-items: center; padding: 0 1rem; font-size: 0.6875rem; font-family: inherit; color: ${t.zinc500}; z-index: 100; gap: 1.5rem; box-sizing: border-box;`,
    stat: `cursor: pointer; transition: color ${ease}; &:hover { color: ${t.zinc200}; }`,
    counter: `margin-left: auto; color: ${t.indigo400}; font-weight: 700;`,
  };

  /**
   * Subscribes to the global 'counter' signal on mount.
   */
  protected onMount() {
    this.createEffect('counter', (val) => {
      this.setState({ counter: val });
    });
  }

  /**
   * Renders the status bar content, including stats and the reactive counter.
   */
  render() {
    const primitives = this.state.primitives || '0';
    const wasmFuncs = this.state['wasm-functions'] || '0';
    const counter = this.state.counter || 0;

    return `
      <div class="host">
        <div class="stat">
            Primitives: <span>${primitives}</span>
        </div>
        <div class="stat">
            WASM Functions: <span>${wasmFuncs}</span>
        </div>
        <div id="state-counter" class="counter">Counter: ${counter}</div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.stat')) {
        this.emit('show-modal');
      }
    });
  }
}
