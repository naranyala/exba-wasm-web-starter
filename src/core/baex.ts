import type { BaexBridge } from '../bridge/types';
import type { IRBundle } from './schema';
import { IRProcessor } from './processor';

export class BAEX {
  static bridge: BaexBridge | null = null;
  static DEBUG = true;
  static wasmModule: any = null;
  static subscriptions = new Map<string, Set<(val: any) => void>>();

  static log(phase: string, message: any) {
    if (this.DEBUG) {
      console.log(`%c[BAEX IR][${phase}]`, 'color: #818cf8; font-weight: bold;', message);
    }
  }

  static subscribe(key: string, callback: (val: any) => void) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);
    return () => this.subscriptions.get(key)?.delete(callback);
  }

  static notify(key: string, value: any) {
    this.subscriptions.get(key)?.forEach(cb => cb(value));
  }

  static async initWasm(initFn: any) {
    this.log('WASM_INIT_START', {});
    try {
      this.wasmModule = await initFn();
      this.log('WASM_INIT_SUCCESS', { module: this.wasmModule });
    } catch (e) {
      this.log('WASM_INIT_ERROR', e);
      throw e;
    }
  }

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
    this.log('BRIDGE_CALL', { method, args });
    const result = await this.bridge.call<T>(method, ...args);
    this.log('BRIDGE_RESPONSE', result);
    return result;
  }

  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }
}
