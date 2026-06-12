import { EXBA } from '@core/lifecycle/exba';
import { ResilienceManager } from '@core/lifecycle/resilience';
import { activeEffect, activeMemo, notifySubscribers, type Subscriber, type Trackable } from '@core/reactivity/primitives';

/**
 * Creates a general-purpose reactive proxy of an object.
 * 
 * Properties accessed within an `effect` or `memo` will be automatically tracked.
 * Changes to properties will trigger updates to dependent effects/memos.
 */
export function reactive<T extends object>(target: T): T {
  const proxyCache = new WeakMap<object, any>();
  const propertySubs = new WeakMap<object, Map<string, Set<Subscriber>>>();
  const trackables = new WeakMap<object, Map<string, Trackable>>();

  const getSubsForProp = (obj: object, prop: string) => {
    let subsMap = propertySubs.get(obj);
    if (!subsMap) {
      subsMap = new Map();
      propertySubs.set(obj, subsMap);
    }
    if (!subsMap.has(prop)) {
      subsMap.set(prop, new Set());
    }
    return subsMap.get(prop)!;
  };

  const getTrackable = (obj: object, prop: string): Trackable => {
    let objTrackables = trackables.get(obj);
    if (!objTrackables) {
      objTrackables = new Map();
      trackables.set(obj, objTrackables);
    }

    let trackable = objTrackables.get(prop);
    if (!trackable) {
      const subs = getSubsForProp(obj, prop);
      trackable = {
        subscribeDep: (sub: Subscriber) => subs.add(sub),
        unsubscribeDep: (sub: Subscriber) => subs.delete(sub),
      };
      objTrackables.set(prop, trackable);
    }
    return trackable;
  };

  const createProxy = (obj: any) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (proxyCache.has(obj)) return proxyCache.get(obj);

    const handler: ProxyHandler<any> = {
      get(target, prop: string) {
        const value = Reflect.get(target, prop);
        
        if (typeof prop === 'string') {
          const trackable = getTrackable(target, prop);
          if (activeEffect) activeEffect.deps.add(trackable);
          if (activeMemo) activeMemo.deps.add(trackable);
        }

        return createProxy(value);
      },
      set(target, prop: string, value) {
        const oldValue = target[prop];
        if (oldValue === value) return true;
        const result = Reflect.set(target, prop, value);
        
        if (typeof prop === 'string') {
          console.log(`[EXBA reactive] Mutating property "${prop}" from ${oldValue} to ${value}`);
          const subs = getSubsForProp(target, prop);
          notifySubscribers(subs, value);
        }
        return result;
      },
    };

    const proxy = new Proxy(obj, handler);
    proxyCache.set(obj, proxy);
    return proxy;
  };

  return createProxy(target);
}

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
 * 4. Track dependencies for `effect` and `memo`.
 *
 * Supports nested objects and arrays by recursively applying proxies.
 */
export class ReactiveStateProxy {
  private state: any;
  private options: StateOptions;
  private proxy: any;
  private proxyCache = new WeakMap<object, any>();
  private propertySubs = new WeakMap<object, Map<string, Set<Subscriber>>>();

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

  private getSubsForProp(obj: object, prop: string) {
    let subsMap = this.propertySubs.get(obj);
    if (!subsMap) {
      subsMap = new Map();
      this.propertySubs.set(obj, subsMap);
    }
    if (!subsMap.has(prop)) {
      subsMap.set(prop, new Set());
    }
    return subsMap.get(prop)!;
  }

  private trackables = new WeakMap<object, Map<string, Trackable>>();

  private getTrackable(target: object, prop: string): Trackable {
    let targetTrackables = this.trackables.get(target);
    if (!targetTrackables) {
      targetTrackables = new Map();
      this.trackables.set(target, targetTrackables);
    }

    let trackable = targetTrackables.get(prop);
    if (!trackable) {
      const subs = this.getSubsForProp(target, prop);
      trackable = {
        subscribeDep: (sub: Subscriber) => subs.add(sub),
        unsubscribeDep: (sub: Subscriber) => subs.delete(sub),
      };
      targetTrackables.set(prop, trackable);
    }
    return trackable;
  }

  private createDeepProxy(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (this.proxyCache.has(obj)) return this.proxyCache.get(obj);

    const handler: ProxyHandler<any> = {
      get: (target, prop: string) => {
        const value = Reflect.get(target, prop);
        
        if (typeof prop === 'string') {
          const trackable = this.getTrackable(target, prop);
          if (activeEffect) {
            console.log(`[EXBA Proxy] Tracking property "${prop}" for effect`);
            activeEffect.deps.add(trackable);
          }
          if (activeMemo) {
            console.log(`[EXBA Proxy] Tracking property "${prop}" for memo`);
            activeMemo.deps.add(trackable);
          }
        }

        return this.createDeepProxy(value);
      },
      set: (target, prop: string, value) => {
        const oldValue = target[prop];
        if (oldValue === value) return true;
        const result = Reflect.set(target, prop, value);
        
        if (typeof prop === 'string') {
          console.log(`[EXBA Proxy] Mutating property "${prop}" from ${oldValue} to ${value}`);
          const subs = this.getSubsForProp(target, prop);
          notifySubscribers(subs, value);
          this.handleUpdate(prop, value, oldValue);
        }
        return result;
      },
    };

    const proxy = new Proxy(obj, handler);
    this.proxyCache.set(obj, proxy);
    return proxy;
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
