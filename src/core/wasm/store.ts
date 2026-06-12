import { EXBA, type Signal, signal } from '@core/lifecycle/exba';

/**
 * A WasmStore is a typed mirror of a Rust state struct.
 * It manages a collection of signals that are kept in sync with the WASM backend.
 */
export class WasmStore<T extends Record<string, any>> {
  private signals = new Map<keyof T, Signal<any>>();
  private schema: Record<keyof T, any>;

  constructor(schema: Record<keyof T, any>) {
    this.schema = schema;
    
    // Initialize signals based on schema
    for (const key of Object.keys(schema)) {
      const initialValue = schema[key];
      const sig = EXBA.createSignal(initialValue, `store_${this.constructor.name}_${key}`);
      
      // Bind to WASM state mirror
      EXBA.bindSignalToWasm(sig, key as string);
      this.signals.set(key as keyof T, sig);
    }
  }

  /**
   * Access a signal for a specific key in the store.
   */
  get<K extends keyof T>(key: K): Signal<T[K]> {
    return this.signals.get(key) as Signal<T[K]>;
  }

  /**
   * Update multiple values in the store.
   * This uses EXBA.batch to prevent redundant UI renders.
   */
  set(patch: Partial<T>) {
    EXBA.batch(() => {
      for (const [key, value] of Object.entries(patch)) {
        const sig = this.signals.get(key as keyof T);
        if (sig) {
          sig.value = value;
        }
      }
    });
  }

  /**
   * Returns the current snapshot of the store as a plain object.
   */
  snapshot(): T {
    const snap = {} as T;
    this.signals.forEach((sig, key) => {
      snap[key] = sig.value;
    });
    return snap;
  }
}
