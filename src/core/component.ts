import { BAEX } from './baex';

export abstract class BaexComponent extends HTMLElement {
  protected activeSubscriptions: Array<() => void> = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  abstract render(): string;

  connectedCallback() {
    this.update();
  }

  disconnectedCallback() {
    this.activeSubscriptions.forEach(unsub => unsub());
    this.activeSubscriptions = [];
  }

  attributeChangedCallback() {
    this.update();
  }

  update() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render();
    }
  }

  protected subscribeToState(key: string, callback: (val: any) => void) {
    const unsub = BAEX.subscribe(key, (val) => {
      callback(val);
      this.update();
    });
    this.activeSubscriptions.push(unsub);
  }

  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return BAEX.callBridge<T>(method, ...args);
  }
}
