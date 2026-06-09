import { EXBA } from './exba';

export abstract class ExbaComponent extends HTMLElement {
  protected activeSubscriptions: Array<() => void> = [];
  protected state: any = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  abstract render(): string;

  connectedCallback() {
    this.safeUpdate();
  }

  disconnectedCallback() {
    this.activeSubscriptions.forEach((unsub) => {
      unsub();
    });
    this.activeSubscriptions = [];
  }

  setState(newState: any) {
    this.state = { ...this.state, ...newState };
    this.safeUpdate();
  }

  /** Render with error boundary — if render() throws, show fallback instead of crashing. */
  private safeUpdate() {
    if (!this.shadowRoot) return;
    try {
      this.shadowRoot.innerHTML = this.render();
    } catch (e) {
      console.error(
        `[EXBA] Render error in <${this.tagName.toLowerCase()}>:`,
        e,
      );
      this.shadowRoot.innerHTML = `
        <div style="padding: 0.5rem; color: #ef4444; font-size: 0.8125rem; font-family: monospace;">
          Render error: ${e instanceof Error ? e.message : String(e)}
        </div>
      `;
    }
  }

  protected subscribeToState(key: string) {
    const unsub = EXBA.subscribe(key, (val) => {
      this.setState({ [key]: val });
    });
    this.activeSubscriptions.push(unsub);
  }

  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return EXBA.callBridge<T>(method, ...args);
  }
}
