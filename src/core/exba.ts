import type { ExbaBridge } from '../bridge/types';
import { IRProcessor } from './processor';
import type { IRBundle } from './schema';

export class EXBA {
  static bridge: ExbaBridge | null = null;
  static DEBUG = true;
  static wasmModule: any = null;
  static subscriptions = new Map<string, Set<(val: any) => void>>();
  private static eventListeners = new Map<string, Set<(data: any) => void>>();

  static log(phase: string, message: any) {
    if (EXBA.DEBUG) {
      console.log(
        `%c[EXBA IR][${phase}]`,
        'color: #818cf8; font-weight: bold;',
        message,
      );
    }
  }

  // ─── Signal System ──────────────────────────────────────────
  static subscribe(key: string, callback: (val: any) => void) {
    if (!EXBA.subscriptions.has(key)) {
      EXBA.subscriptions.set(key, new Set());
    }
    EXBA.subscriptions.get(key)!.add(callback);
    return () => EXBA.subscriptions.get(key)?.delete(callback);
  }

  static notify(key: string, value: any) {
    EXBA.subscriptions.get(key)?.forEach((cb) => {
      cb(value);
    });
  }

  // ─── Event System ───────────────────────────────────────────
  static addEventListener(event: string, callback: (data: any) => void) {
    if (!EXBA.eventListeners.has(event)) {
      EXBA.eventListeners.set(event, new Set());
    }
    EXBA.eventListeners.get(event)!.add(callback);
    return () => EXBA.eventListeners.get(event)?.delete(callback);
  }

  static emit(event: string, data?: any) {
    EXBA.eventListeners.get(event)?.forEach((cb) => {
      cb(data);
    });
  }

  // ─── WASM ───────────────────────────────────────────────────
  static async initWasm(initFn: any) {
    EXBA.log('WASM_INIT_START', {});
    try {
      EXBA.wasmModule = await initFn();
      EXBA.log('WASM_INIT_SUCCESS', { module: EXBA.wasmModule });
      return EXBA.wasmModule;
    } catch (e) {
      EXBA.log('WASM_INIT_ERROR', e);
      throw e;
    }
  }

  static setBridge(bridge: ExbaBridge) {
    EXBA.bridge = bridge;
  }

  static register(tagName: string, componentClass: new () => HTMLElement) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }
  }

  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!EXBA.bridge) {
      throw new Error('EXBA Bridge not initialized');
    }
    EXBA.log('BRIDGE_CALL', { method, args });
    const result = await EXBA.bridge.call<T>(method, ...args);
    EXBA.log('BRIDGE_RESPONSE', result);
    return result;
  }

  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }
}
