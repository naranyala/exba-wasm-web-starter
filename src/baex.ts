/**
 * BAEX Framework Core
 * A lightweight bridge between Rust WASM and Custom Elements
 */

export interface BaexBridge {
  call<T>(method: string, ...args: any[]): Promise<T>;
  on(event: string, callback: (data: any) => void): void;
}

export class BAEX {
  static bridge: BaexBridge | null = null;

  static setBridge(bridge: BaexBridge) {
    this.bridge = bridge;
  }

  static register(tagName: string, componentClass: new () => HTMLElement) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }
  }

  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!this.bridge) {
      throw new Error('BAEX Bridge not initialized');
    }
    return this.bridge.call<T>(method, ...args);
  }
}

export abstract class BaexComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  abstract render(): string;

  connectedCallback() {
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  update() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render();
    }
  }

  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return BAEX.callBridge<T>(method, ...args);
  }
}
