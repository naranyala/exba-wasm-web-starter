import { EXBA } from '@core/lifecycle/exba';
import { ResilienceManager } from '@core/lifecycle/resilience';

/**
 * Configuration options for the reactive state proxy.
 */
export interface StateOptions {
  /** Called whenever any part of the state object is updated */
  onUpdate?: (newState: any) => void;
  /** Called when a specific property is updated */
  onPropertyUpdate?: (prop: string, value: any, oldValue: any) => void;
}

/**
 * Creates a deeply reactive proxy of a state object.
 * 
 * Any changes made to the state via this proxy will automatically:
 * 1. Synchronize with the underlying WASM application state (if healthy).
 * 2. Trigger configured update callbacks.
 * 3. Notify global EXBA signal subscribers for the updated property.
 * 
 * Supports nested objects and arrays by recursively applying proxies.
 */
export class ReactiveStateProxy {
  private state: any;
  private options: StateOptions;
  private proxy: any;

  /**
   * Initializes a new reactive state proxy.
   * @param initialState The starting state object
   * @param options Update callbacks
   * @param autoSync Whether to immediately sync with WASM state (default: true)
   */
  constructor(
    initialState: any = {},
    options: StateOptions = {},
    autoSync = true,
  ) {
    // If only one argument is provided and it has StateOptions keys, swap them.
    // This handles both new ReactiveStateProxy(options) and new ReactiveStateProxy(initial, options)
    if (
      arguments.length === 1 &&
      (initialState.onUpdate || initialState.onPropertyUpdate)
    ) {
      this.options = initialState;
      this.state = {};
    } else {
      this.state = initialState;
      this.options = options;
    }

    this.proxy = this.createDeepProxy(this.state);
    if (autoSync) {
      this.sync();
    }
  }

  /**
   * Recursively creates a proxy for the target object and its children.
   * @param target The object to wrap in a proxy
   * @returns A reactive proxy
   */
  private createDeepProxy(target: any): any {
    const handler: ProxyHandler<any> = {
      get: (obj, prop) => {
        const value = Reflect.get(obj, prop);
        if (value !== null && typeof value === 'object') {
          return this.createDeepProxy(value);
        }
        return value;
      },
      set: (obj, prop, value) => {
        const oldValue = obj[prop];
        if (oldValue === value) return true;

        const result = Reflect.set(obj, prop, value);

        // Notify and Sync
        this.handleUpdate(prop as string, value, oldValue);

        return result;
      },
    };
    return new Proxy(target, handler);
  }

  /**
   * Internal orchestrator for handling a state property update.
   * Manages WASM synchronization, local callbacks, and global notifications.
   * @param prop The property name that changed
   * @param value The new value
   * @param oldValue The previous value
   */
  private handleUpdate(prop: string, value: any, oldValue: any) {
    // 1. Sync with WASM if module is healthy
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const patch = JSON.stringify({ [prop]: value });
        const wasmUpdate =
          (window as any).wasm_update_app_state ||
          EXBA.wasmModule.wasm_update_app_state;
        if (typeof wasmUpdate === 'function') {
          wasmUpdate(patch);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }

    // 2. Execute callbacks
    this.options.onPropertyUpdate?.(prop, value, oldValue);
    this.options.onUpdate?.(this.state);

    // 3. Notify EXBA subscribers
    EXBA.notify(prop, value);
  }

  /**
   * Manually synchronizes the local proxy state with the current WASM application state.
   */
  public sync() {
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const wasmState = EXBA.wasmModule.wasm_get_app_state();
        if (wasmState) {
          Object.assign(this.state, wasmState);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }
  }

  /**
   * Returns the reactive proxy instance.
   */
  get value() {
    return this.proxy;
  }

  /**
   * Replaces the entire state object.
   * Performs a bulk update in WASM and notifies all top-level keys.
   * @param newFullState The new state object
   */
  set value(newFullState: any) {
    if (ResilienceManager.isWasmHealthy()) {
      try {
        const patch = JSON.stringify(newFullState);
        const wasmUpdate =
          (window as any).wasm_update_app_state ||
          EXBA.wasmModule.wasm_update_app_state;
        if (typeof wasmUpdate === 'function') {
          wasmUpdate(patch);
        }
        ResilienceManager.reportSuccess();
      } catch (e) {
        ResilienceManager.reportFailure(e);
      }
    }

    Object.assign(this.state, newFullState);
    this.options.onUpdate?.(this.state);

    // Notify for all top level keys
    Object.keys(newFullState).forEach((key) => {
      EXBA.notify(key, newFullState[key]);
    });
  }
}
