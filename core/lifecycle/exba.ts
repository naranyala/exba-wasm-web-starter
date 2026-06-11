import type { ExbaBridge } from '@bridge/types';
import { IRProcessor } from '@core/dom/processor';
import { ResilienceManager } from '@core/lifecycle/resilience';
import type { IRBundle } from '@core/dom/schema';

/**
 * EXBA (Extended Browser Api) Core Class
 * 
 * The central orchestrator for the framework. Handles WASM initialization,
 * the Bridge between TS and Rust, the global Signal/Event systems, 
 * and Web Component registration.
 */
export class EXBA {
  /** The communication bridge instance between TypeScript and WebAssembly */
  static bridge: ExbaBridge | null = null;
  /** Proxy-based API object for calling WASM functions directly */
  private static _api: any = null;
  /** Global debug flag for internal logging */
  static DEBUG = true;
  /** The initialized WebAssembly module instance */
  static wasmModule: any = null;
  /** Registry for signal subscriptions, keyed by signal ID */
  static subscriptions = new Map<string, Set<(val: any) => void>>();
  /** Registry for global event listeners */
  static eventListeners = new Map<string, Set<(data: any) => void>>();

  /**
   * Internal logger for framework events.
   * @param phase The architectural phase or event type
   * @param message The payload or message to log
   */
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
  /**
   * Subscribes to changes of a specific signal/key.
   * @param key The unique key of the signal
   * @param callback Function to call when the value changes
   * @returns An unsubscription function
   */
  static subscribe(key: string, callback: (val: any) => void) {
    if (!EXBA.subscriptions.has(key)) {
      EXBA.subscriptions.set(key, new Set());
    }
    EXBA.subscriptions.get(key)!.add(callback);
    return () => EXBA.subscriptions.get(key)?.delete(callback);
  }

  /**
   * Notifies all subscribers of a key that the value has changed.
   * @param key The unique key of the signal
   * @param value The new value
   */
  static notify(key: string, value: any) {
    EXBA.subscriptions.get(key)?.forEach((cb) => {
      cb(value);
    });
  }

  // ─── Event System ───────────────────────────────────────────
  /**
   * Registers a global event listener.
   * @param event The event name
   * @param callback Function to call when the event is emitted
   * @returns An unsubscription function
   */
  static addEventListener(event: string, callback: (data: any) => void) {
    if (!EXBA.eventListeners.has(event)) {
      EXBA.eventListeners.set(event, new Set());
    }
    EXBA.eventListeners.get(event)!.add(callback);
    return () => EXBA.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emits a global event to all registered listeners.
   * @param event The event name
   * @param data Optional data payload
   */
  static emit(event: string, data?: any) {
    EXBA.eventListeners.get(event)?.forEach((cb) => {
      cb(data);
    });
  }

  // ─── WASM ───────────────────────────────────────────────────
  /**
   * Initializes the WebAssembly module.
   * @param initFn The WASM initialization function (typically from wasm-pack bindings)
   * @returns The initialized WASM module
   */
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

  /**
   * Sets the bridge instance and initializes the dynamic API proxy.
   * @param bridge The ExbaBridge implementation
   */
  static setBridge(bridge: ExbaBridge) {
    EXBA.bridge = bridge;
    EXBA._api = EXBA.createApiProxy(bridge);
  }

  /**
   * Provides access to the WASM API. 
   * Throws if the bridge has not been initialized.
   */
  static get api(): any {
    if (!EXBA._api) {
      throw new Error('EXBA Bridge not initialized. Call setBridge first.');
    }
    return EXBA._api;
  }

  /**
   * Creates a Proxy that intercepts property access and turns them into bridge calls.
   * @param bridge The bridge instance
   */
  private static createApiProxy(bridge: ExbaBridge) {
    return new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          return async (...args: any[]) => {
            try {
              const result = await bridge.call(prop, ...args);
              ResilienceManager.reportSuccess();
              return result;
            } catch (e) {
              ResilienceManager.reportFailure(e);
              throw e;
            }
          };
        },
      },
    );
  }

  /**
   * Registers an EXBA component as a Custom Element.
   * Performs validation against the framework's Blueprint Rules.
   * @param tagName The HTML tag name (must contain a hyphen)
   * @param componentClass The component class constructor
   */
  static register(tagName: string, componentClass: any) {
    if (customElements.get(tagName)) return;

    // Blueprint Validation
    const errors: string[] = [];
    if (!componentClass.props) errors.push('Missing static "props" definition');
    if (!componentClass.styles)
      errors.push('Missing static "styles" definition');
    if (!componentClass.prototype.render)
      errors.push('Missing "render()" method implementation');

    if (errors.length > 0) {
      console.error(
        `%c[EXBA Component Error] <${tagName}> violates Blueprint Rules:\n- ${errors.join('\n- ')}`,
        'color: #ef4444; font-weight: bold; background: rgba(239, 68, 68, 0.1); padding: 4px; border-radius: 4px;',
      );
      // We still register it to avoid crashing the whole app, but the developer is warned.
    }

    customElements.define(tagName, componentClass);
  }

  /**
   * Manual entry point for calling bridge methods with type safety.
   * @param method Method name to call in WASM
   * @param args Arguments to pass to the method
   */
  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!EXBA.bridge) {
      throw new Error('EXBA Bridge not initialized');
    }
    EXBA.log('BRIDGE_CALL', { method, args });
    const result = await EXBA.bridge.call<T>(method, ...args);
    EXBA.log('BRIDGE_RESPONSE', result);
    return result;
  }

  /**
   * Dispatches an IR (Intermediate Representation) bundle to the processor.
   * @param bundle The IR bundle to process
   */
  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }

  // ─── Component Helpers ──────────────────────────────────────
  private static isBatching = false;
  private static pendingNotifications = new Set<string>();

  /**
   * Creates a reactive signal.
   * @param initialValue The initial value of the signal
   * @param key Optional unique key for the signal
   * @returns An object with value getter/setter and subscribe method
   */
  static createSignal<T>(initialValue: T, key?: string) {
    let val = initialValue;
    const signalKey = key || `sig_${Math.random().toString(36).substr(2, 9)}`;

    return {
      get value() {
        return val;
      },
      set value(newVal: T) {
        if (val === newVal) return;
        val = newVal;
        if (EXBA.isBatching) {
          EXBA.pendingNotifications.add(signalKey);
        } else {
          EXBA.notify(signalKey, newVal);
        }
      },
      subscribe: (cb: (v: T) => void) => EXBA.subscribe(signalKey, cb),
      key: signalKey,
    };
  }

  /**
   * Creates a computed signal that updates when its dependencies change.
   * @param fn Function that computes the value
   * @param dependencies Array of signal keys that this computed depends on
   * @returns A signal containing the computed value
   */
  static createComputed<T>(fn: () => T, dependencies: string[]) {
    const signal = EXBA.createSignal(fn());
    dependencies.forEach((dep) => {
      EXBA.subscribe(dep, () => {
        signal.value = fn();
      });
    });
    return signal;
  }

  /**
   * Batches multiple signal updates to prevent redundant notifications.
   * @param fn Synchronous function containing multiple signal updates
   */
  static batch(fn: () => void) {
    EXBA.isBatching = true;
    try {
      fn();
    } finally {
      EXBA.isBatching = false;
      const keys = Array.from(EXBA.pendingNotifications);
      EXBA.pendingNotifications.clear();
      keys.forEach((key) => {
        // We don't have the "current value" here in a unified way if it's just keys,
        // but notify() handles calling subscribers.
        // For ReactiveStateProxy integration, it works because notify triggers the cb
        // which usually pulls from state.
        EXBA.notify(key, null);
      });
    }
  }
}
